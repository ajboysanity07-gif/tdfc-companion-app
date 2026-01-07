<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LedgerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'date_in' => $this->date_in?->toISOString(),
            'mreference' => $this->mreference,
            'lntype' => $this->lntype ?? null,
            'transaction_code' => $this->cs_ck,
            'principal' => $this->principal,
            'payments' => $this->payments,
            'debit' => $this->debit,
            'credit' => $this->credit,
            'balance' => $this->balance,
            'accruedint' => $this->accruedint,
        ];
    }
}
