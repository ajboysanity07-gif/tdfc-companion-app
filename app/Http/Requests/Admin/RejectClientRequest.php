<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectClientRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'reasons' => 'required|array|min:1',
            'reasons.*' => 'string|exists:rejection_reasons,code',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reasons.required' => 'At least one rejection reason is required',
            'reasons.array' => 'Reasons must be an array',
            'reasons.min' => 'At least one rejection reason is required',
            'reasons.*.exists' => 'One or more rejection reason codes are invalid',
        ];
    }
}
