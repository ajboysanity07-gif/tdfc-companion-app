<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AppUserResource extends JsonResource
{
    public function toArray($request)
    {
        $disk = (string) config('filesystems.default', 'public');

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
                ? $this->fileUrl($this->profile_picture_path, $disk)
                : null,

            'prc_id_photo_front' => $this->prc_id_photo_front,
            'prc_id_photo_front_url' => $this->prc_id_photo_front
                ? $this->fileUrl($this->prc_id_photo_front, $disk)
                : null,

            'prc_id_photo_back' => $this->prc_id_photo_back,
            'prc_id_photo_back_url' => $this->prc_id_photo_back
                ? $this->fileUrl($this->prc_id_photo_back, $disk)
                : null,

            'payslip_photo_path' => $this->payslip_photo_path,
            'payslip_photo_url' => $this->payslip_photo_path
                ? $this->fileUrl($this->payslip_photo_path, $disk)
                : null,

            // SPA navigation redirect
            'redirect_to' => $this->redirectTo,
        ];
    }

    private function fileUrl(?string $path, string $disk): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        try {
            $storage = Storage::disk($disk);

            if (! $storage->exists($path)) {
                return null;
            }

            return $storage->url($path);
        } catch (\Throwable $exception) {
            Log::warning('Failed to resolve media URL', [
                'path' => $path,
                'disk' => $disk,
                'exception_class' => $exception::class,
                'exception' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
