<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class AppUserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            // Basic info
            'user_id' => $this->user_id,
            'acctno' => $this->acctno,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'phone_no' => $this->phone_no,

            // File storage paths (for audit/log)
            'profile_picture_path' => $this->profile_picture_path,

            // Public URLs for SPA rendering (future-proof: supports custom CDN, S3, etc.)
            'profile_picture_url' => $this->profile_picture_path
                ? Storage::url($this->profile_picture_path)
                : null,

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

            // SPA navigation redirect
            'redirect_to' => $this->redirectTo,
        ];
    }
}
