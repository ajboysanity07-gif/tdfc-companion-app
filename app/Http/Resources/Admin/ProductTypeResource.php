<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'typecode' => $this->typecode,
            'lntype' => $this->lntype,
            'lntags' => $this->lntags,
            'description' => $this->description,
            'controlno' => $this->controlno,
        ];
    }
}
