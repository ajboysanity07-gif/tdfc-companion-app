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
    public function __invoke(Request $request, MathExpressionEvaluator $math): Response
    {
        $acctno = $request->user()?->acctno;
        $basic = $acctno ? WSalaryRecord::where('acctno', $acctno)->orderBy('created_at', 'desc')->value('salary_amount') : null;

        $products = WlnProduct::with('tags')
            ->where('isDisplayed', true)
            ->where('ln_isActive', true)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->typecode,
                'name' => $t->lntype,
                'tags' => $t->tags->pluck('tag_name')->map(fn ($n) => trim($n))->values(),
                // max_term is stored in days; the calculator works in months
                'max_term_months' => max(1, (int) round(($t->max_term ?? 0) / 30)),
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
                'terms' => $t->terms_and_info,
            ])
            ->values();

        return Inertia::render('loans/calculator', ['products' => $products]);
    }
}
