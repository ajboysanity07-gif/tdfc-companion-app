<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->product_id,
            'product_code' => $this->product_code,
            'product_name' => $this->product_name,
            'is_active' => (bool) $this->is_active,
            'is_multiple' => (bool) $this->is_multiple,
            'schemes' => $this->schemes,
            'mode' => $this->mode,
            'interest_rate' => (float) $this->interest_rate,
            'max_term_days' => (int) $this->max_term_days,
            'is_max_term_editable' => (bool) $this->is_max_term_editable,
            'max_amortization_mode' => $this->max_amortization_mode,
            'max_amortization_formula' => $this->max_amortization_formula,
            'max_amortization' => $this->max_amortization ? (int) $this->max_amortization : null,
            'is_max_amortization_editable' => (bool) $this->is_max_amortization_editable,
            'service_fee' => $this->service_fee ? (float) $this->service_fee : null,
            'lrf' => $this->lrf ? (float) $this->lrf : null,
            'document_stamp' => $this->document_stamp ? (float) $this->document_stamp : null,
            'mort_plus_notarial' => $this->mort_plus_notarial ? (float) $this->mort_plus_notarial : null,
            'terms' => $this->terms,
            'types' => ProductTypeResource::collection($this->whenLoaded('types')),
            'tags' => ProductTypeResource::collection($this->whenLoaded('tags')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
