<?php

namespace App\Services\Client;

use App\Models\WlnProducts;
use App\Models\WSalaryRecord;

class LoanCalculationService
{
    public function __construct(
        private MathExpressionEvaluator $mathEvaluator
    ) {}

    /**
     * Calculate maximum amortization for a product based on mode.
     */
    public function calculateMaxAmortization(WlnProducts $product, string $acctno): float
    {
        return match ($product->max_amortization_mode) {
            WlnProducts::MODE_FIXED => $this->calculateFixedAmortization($product),
            WlnProducts::MODE_BASIC, WlnProducts::MODE_CUSTOM => $this->calculateDynamicAmortization($product, $acctno),
            default => 0.00,
        };
    }

    /**
     * Calculate fixed amortization from product max_amortization field.
     */
    private function calculateFixedAmortization(WlnProducts $product): float
    {
        if (empty($product->max_amortization)) {
            return 0.00;
        }

        $cleanedValue = preg_replace('/[,\s]/', '', $product->max_amortization);
        return (float) $cleanedValue;
    }

    /**
     * Calculate dynamic amortization based on salary and formula.
     */
    private function calculateDynamicAmortization(WlnProducts $product, string $acctno): float
    {
        $basicSalary = $this->getBasicSalary($acctno);
        
        if ($basicSalary === null || empty($product->max_amortization_formula)) {
            return 0.00;
        }

        if (trim($product->max_amortization_formula) === 'basic') {
            return $basicSalary;
        }

        $evalResult = $this->mathEvaluator->evaluate($product->max_amortization_formula, $basicSalary);
        
        return $evalResult['success'] ? (float) $evalResult['result'] : 0.00;
    }

    /**
     * Get basic salary for an account.
     */
    private function getBasicSalary(string $acctno): ?float
    {
        $salaryRecord = WSalaryRecord::where('acctno', $acctno)->first();
        
        if (!$salaryRecord || !is_numeric($salaryRecord->salary_amount)) {
            return null;
        }

        return (float) $salaryRecord->salary_amount;
    }

    /**
     * Calculate loan fees and net proceeds.
     */
    public function calculateLoanFees(WlnProducts $product, float $amortization, float $oldBalance): array
    {
        $serviceFee = $product->service_fee ?? 0;
        $lrf = $product->lrf ?? 0;
        $documentStamp = $product->document_stamp ?? 0;
        $mortPlusNotarial = $product->mort_plus_notarial ?? 0;
        
        $totalDeductions = $serviceFee + $lrf + $documentStamp + $mortPlusNotarial + $oldBalance;
        $estimatedNetProceeds = max(0, $amortization - $totalDeductions);

        return [
            'service_fee' => $serviceFee,
            'lrf' => $lrf,
            'document_stamp' => $documentStamp,
            'mort_plus_notarial' => $mortPlusNotarial,
            'total_deductions' => $totalDeductions,
            'estimated_net_proceeds' => $estimatedNetProceeds,
        ];
    }

    /**
     * Validate amortization amount with error message.
     */
    public function validateAmortization(WlnProducts $product, float $amortization, string $acctno): ?string
    {
        $computedResult = $this->calculateMaxAmortization($product, $acctno);
        
        if ($computedResult > 0 && $amortization > $computedResult) {
            return "Amortization exceeds maximum allowed (₱" . number_format($computedResult, 2) . ") for this product";
        }

        return null;
    }

    /**
     * Validate term months with error message.
     */
    public function validateTermMonths(WlnProducts $product, int $termMonths): ?string
    {
        $maxTermMonths = floor($product->max_term_days / 30);
        
        if ($termMonths > $maxTermMonths) {
            return "Term exceeds maximum allowed ({$maxTermMonths} months) for this product";
        }

        return null;
    }
}
