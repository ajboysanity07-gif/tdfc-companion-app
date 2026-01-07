<?php

namespace App\Http\Resources\Client;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'controlno' => (string) $this->controlno,
            'svstatus' => (string) ($this->svstatus ?? ''),
            'acctno' => (string) $this->acctno,
            'svnumber' => (string) $this->svnumber,
            'typecode' => (string) ($this->typecode ?? ''),
            'svtype' => (string) ($this->svtype ?? ''),
            'date_in' => $this->date_in ? (new Carbon($this->date_in))->toISOString() : null,
            'mreference' => (string) ($this->mreference ?? ''),
            'cs_ck' => (string) ($this->cs_ck ?? ''),
            'deposit' => is_numeric($this->deposit) ? (float) $this->deposit : 0.0,
            'withdrawal' => is_numeric($this->withdrawal) ? (float) $this->withdrawal : 0.0,
            'balance' => is_numeric($this->balance) ? (float) $this->balance : 0.0,
        ];
    }
}
