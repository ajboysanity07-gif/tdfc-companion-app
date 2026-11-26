<?php

namespace App\Http\Controllers;

use App\Models\WlnProduct;
use App\Models\WSalaryRecord;
use App\Services\MathExpressionEvaluator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanCalculatorController extends Controller
{
    private const MODES = ['MONTHLY', 'SEMI-ANNUAL', 'DUE-DATE'];

    public function __invoke(Request $request, MathExpressionEvaluator $math): Response
    {
        $acctno = $request->user()?->acctno;
        $basic = $acctno ? WSalaryRecord::where('acctno', $acctno)->orderBy('created_at', 'desc')->value('salary_amount') : null;

        $products = WlnProduct::with('tags')
            ->where('isDisplayed', true)
            ->where('ln_isActive', true)
            ->get()
            // a mode the calculator cannot compute (the retired WEEKLY) stays hidden until an admin changes it
            ->filter(fn ($t) => in_array($t->installment_mode ?: 'MONTHLY', self::MODES, true))
            ->map(fn ($t) => [
                'id' => $t->typecode,
                'name' => $t->lntype,
                'tags' => $t->tags->pluck('tag_name')->map(fn ($n) => trim($n))->values(),
                'scheme' => $t->ln_scheme ?: 'ADD-ON',
                'mode' => $t->installment_mode ?: 'MONTHLY',
                'max_term_days' => (int) ($t->max_term ?? 0),
                'cutoff_day' => (int) config('loans.cutoff_day'),
                'term_editable' => (bool) $t->max_term_isEditable,
                'max_amortization' => match ($t->max_amortization_mode) {
                    'BASIC', 'CUSTOM' => is_numeric($basic) && ($r = $math->evaluate((string) $t->max_amortization_formula, (float) $basic))['success']
                        ? (float) $r['result'] : 0.0,
                    default => (float) ($t->max_amortization ?? 0),
                },
                'max_amortization_formula' => $t->max_amortization_mode === 'CUSTOM' ? $t->max_amortization_formula : null,
                'amortization_editable' => (bool) $t->max_amortization_isEditable,
                'interest_rate' => (float) ($t->int_rate ?? 0),
                'service_fee' => (float) ($t->service_fee ?? 0),
                'lrf' => (float) ($t->lrf ?? 0),
                'document_stamp' => (float) ($t->doc_stamp ?? 0),
                'mort_plus_notarial' => (float) ($t->mort_notarial ?? 0),
                'custom_fees' => collect($t->custom_fees)
                    ->map(fn ($f) => ['label' => $f['label'], 'type' => $f['type'], 'value' => (float) $f['value']])
                    ->values(),
                'terms' => $t->terms_and_info,
            ])
            ->values();

        return Inertia::render('loans/calculator', ['products' => $products]);
    }
}
