<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ClientResource extends JsonResource
{
    private function fileUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::url($path);
    }

    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $profileUrl = $this->fileUrl($this->profile_picture_path);
        
        // Debug logging
        \Log::info('ClientResource avatar', [
            'user_id' => $this->user_id,
            'path' => $this->profile_picture_path,
            'url' => $profileUrl,
            'app_url' => config('app.url')
        ]);
        
        return [
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_picture_path' => $this->profile_picture_path,
            'profile_picture_url' => $profileUrl,
            'phone_no' => $this->phone_no,
            'acctno' => $this->acctno,
            'status' => $this->status,
            'class' => $this->when(isset($this->loan_class), $this->loan_class),
            'prc_id_photo_front' => $this->prc_id_photo_front,
            'prc_id_photo_front_url' => $this->fileUrl($this->prc_id_photo_front),
            'prc_id_photo_back' => $this->prc_id_photo_back,
            'prc_id_photo_back_url' => $this->fileUrl($this->prc_id_photo_back),
            'payslip_photo_path' => $this->payslip_photo_path,
            'payslip_photo_url' => $this->fileUrl($this->payslip_photo_path),
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
