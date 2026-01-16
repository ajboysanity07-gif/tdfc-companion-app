<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_picture_path' => $this->profile_picture_path,
            'profile_picture_url' => $this->profile_picture_path
                ? Storage::url($this->profile_picture_path)
                : null,
            'phone_no' => $this->phone_no,
            'acctno' => $this->acctno,
            'status' => $this->status,
            'class' => $this->when(isset($this->loan_class), $this->loan_class),
            'prc_id_photo_front' => $this->prc_id_photo_front,
            'prc_id_photo_front_url' => $this->prc_id_photo_front
                ? Storage::url($this->prc_id_photo_front)
                : null,
            'prc_id_photo_back' => $this->prc_id_photo_back,
            'prc_id_photo_back_url' => $this->prc_id_photo_back
                ? Storage::url($this->prc_id_photo_back)
                : null,
            'payslip_photo_path' => $this->payslip_photo_path,
            'payslip_photo_url' => $this->payslip_photo_path
                ? Storage::url($this->payslip_photo_path)
                : null,
            'created_at' => $this->created_at?->toISOString(),
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'reviewed_by' => $this->reviewed_by,
            'salary_amount' => $this->when(isset($this->salary_amount), $this->salary_amount),
            'rejection_reasons' => $this->when(
                $this->isRejected(),
                fn() => $this->rejectionReasons->map(fn($r) => [
                    'code' => $r->code,
                    'label' => $r->label,
                ])->toArray(),
                []
            ),
        ];
    }
}
