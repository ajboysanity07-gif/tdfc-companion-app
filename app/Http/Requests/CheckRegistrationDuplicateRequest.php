<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckRegistrationDuplicateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'accntno' => 'sometimes|string|max:6',
            'email' => 'sometimes|email',
            'phone_no' => ['sometimes', 'digits:11', 'regex:/^09\d{9}$/'],
            'username' => ['sometimes', 'string', 'min:3', 'max:30', 'regex:/^[A-Za-z0-9._-]+$/'],
            'full_name' => 'sometimes|string|max:255',
        ];
    }
}
