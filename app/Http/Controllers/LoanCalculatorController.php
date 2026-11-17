<?php

namespace App\Http\Controllers;

use App\Models\WlnType;
use Inertia\Inertia;
use Inertia\Response;

class LoanCalculatorController extends Controller
{
    public function __invoke(): Response
    {
        $products = WlnType::with('settings')
            ->whereHas('display', fn ($q) => $q->where('isDisplayed', true))
            ->whereHas('settings', fn ($q) => $q->where('ln_isActive', true))
            ->get()
            ->map(fn ($t) => [
                'id' => $t->typecode,
                'name' => $t->lntype,
                // max_term is stored in days; the calculator works in months
                'max_term_months' => max(1, (int) round(($t->settings->max_term ?? 0) / 30)),
                'term_editable' => (bool) $t->settings->max_term_isEditable,
                'max_amortization' => (float) ($t->settings->max_amortization ?? 0),
                'amortization_editable' => (bool) $t->settings->max_amortization_isEditable,
                'interest_rate' => (float) ($t->int_rate ?? 0),
                'service_fee' => (float) ($t->settings->service_fee ?? 0),
                'lrf' => (float) ($t->settings->lrf ?? 0),
                'document_stamp' => (float) ($t->settings->doc_stamp ?? 0),
                'mort_plus_notarial' => (float) ($t->settings->mort_notarial ?? 0),
                'terms' => $t->settings->terms_and_info,
            ])
            ->values();

        return Inertia::render('loans/calculator', ['products' => $products]);
    }
}
