<?php

namespace App\Services\Client;

use Carbon\Carbon;

class LoanClassificationService
{
    public const CLASS_A = 'A';
    public const CLASS_B = 'B';
    public const CLASS_C = 'C';
    public const CLASS_D = 'D';

    public const THRESHOLD_CLASS_B = 60; // days
    public const THRESHOLD_CLASS_C = 90; // days

    private const PRIORITY_A = 1;
    private const PRIORITY_B = 2;
    private const PRIORITY_C = 3;
    private const PRIORITY_D = 4;

    public const LOAN_STATUS_MATURED = 'MATURED';

    /**
     * Determine loan classification from loan rows.
     */
    public function classify($loanRows): ?string
    {
        if (!$loanRows || count($loanRows) === 0) {
            return null;
        }

        $highestPriority = null;

        foreach ($loanRows as $loanData) {
            $priority = $this->calculatePriority($loanData);

            if ($priority !== null && ($highestPriority === null || $priority > $highestPriority)) {
                $highestPriority = $priority;
            }
        }

        $highestPriority = $highestPriority ?? self::PRIORITY_D;

        return $this->mapPriorityToClass($highestPriority);
    }

    /**
     * Calculate priority for a single loan.
     */
    private function calculatePriority(object $loanData): ?int
    {
        $loanStatus = $loanData->loan_status ?? null;
        
        if ($loanStatus !== self::LOAN_STATUS_MATURED) {
            return self::PRIORITY_A;
        }

        $dateEnd = isset($loanData->date_end) ? Carbon::parse($loanData->date_end) : null;
        
        if ($dateEnd === null) {
            return null;
        }

        $diffDays = $dateEnd->diffInDays(now(), false);

        if ($diffDays <= 0) {
            return null;
        }

        return match (true) {
            $diffDays < self::THRESHOLD_CLASS_B => self::PRIORITY_B,
            $diffDays < self::THRESHOLD_CLASS_C => self::PRIORITY_C,
            default => self::PRIORITY_D,
        };
    }

    /**
     * Map priority number to class letter.
     */
    private function mapPriorityToClass(int $priority): ?string
    {
        return match ($priority) {
            self::PRIORITY_A => self::CLASS_A,
            self::PRIORITY_B => self::CLASS_B,
            self::PRIORITY_C => self::CLASS_C,
            self::PRIORITY_D => self::CLASS_D,
            default => null,
        };
    }
}
