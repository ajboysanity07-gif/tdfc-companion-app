<?php

namespace App\Http\Resources\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AmortizationScheduleResource extends JsonResource
{
    private bool $includeIds;

    public function __construct($resource, bool $includeIds = false)
    {
        parent::__construct($resource);
        $this->includeIds = $includeIds;
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $data = [
            'date_pay' => optional($this->Date_pay)->toISOString(),
            'amortization' => $this->Amortization,
            'interest' => $this->Interest,
            'balance' => $this->Balance,
        ];

        if ($this->includeIds) {
            $data = [
                'controlno' => (string) $this->controlno,
                'lnnumber' => (string) $this->lnnumber,
                ...$data,
            ];
        }

        return $data;
    }
}
