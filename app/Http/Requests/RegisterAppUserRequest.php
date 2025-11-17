<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterAppUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // guests only by route middleware
    }

    public function rules(): array
    {
        return [
            'accntno' => ['required', 'string', 'max:6', Rule::exists('wmaster', 'acctno')],
            'full_name' => ['nullable', 'string', 'max:255'], // from wmaster, ignored server-side
            'phone_no' => ['required', 'regex:/^\d{11}$/'],
            'email' => ['required', 'email', 'max:255', Rule::unique('app_user_table', 'email')],
            'password' => ['required', 'confirmed', 'min:8'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'prc_id_photo_front' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'prc_id_photo_back'  => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',

            'payslip_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone_no.regex' => 'Phone must be 11 digits.',
        ];
    }
}
