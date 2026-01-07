<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_name' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|required|boolean',
            'is_multiple' => 'sometimes|required|boolean',
            'schemes' => 'sometimes|nullable|string',
            'mode' => 'sometimes|nullable|string',
            'interest_rate' => 'sometimes|required|numeric|min:0',
            'max_term_days' => 'sometimes|required|integer|min:1',
            'is_max_term_editable' => 'sometimes|nullable|boolean',
            'max_amortization_mode' => 'sometimes|required|string|in:FIXED,BASIC,CUSTOM',
            'max_amortization_formula' => [
                'nullable',
                Rule::requiredIf(fn() => $this->input('max_amortization_mode') === 'CUSTOM'),
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    if ($this->input('max_amortization_mode') !== 'CUSTOM') {
                        return;
                    }

                    if (!preg_match('/\bbasic\b/i', $value ?? '')) {
                        return $fail('Custom formula must include the variable "basic".');
                    }

                    if (!preg_match('~^[0-9+\-*\/().\s]*\bbasic\b[0-9+\-*\/().\s]*$~i', $value)) {
                        return $fail('Allowed: numbers, + - * / ( ), and the variable "basic".');
                    }
                },
            ],
            'max_amortization' => [
                'nullable',
                'integer',
                'min:0',
                Rule::requiredIf(fn() => $this->input('max_amortization_mode') === 'FIXED'),
            ],
            'is_max_amortization_editable' => 'sometimes|nullable|boolean',
            'service_fee' => 'sometimes|nullable|numeric|min:0',
            'lrf' => 'sometimes|nullable|numeric|min:0',
            'document_stamp' => 'sometimes|nullable|numeric|min:0',
            'mort_plus_notarial' => 'sometimes|nullable|numeric|min:0',
            'terms' => 'sometimes|nullable|string',
            'typecodes' => 'sometimes|required|array|min:1',
            'typecodes.*' => 'string|size:2|exists:wlntype,typecode',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_name.required' => 'Product name is required',
            'interest_rate.required' => 'Interest rate is required',
            'interest_rate.min' => 'Interest rate cannot be negative',
            'max_term_days.required' => 'Maximum term is required',
            'max_term_days.min' => 'Maximum term must be at least 1 day',
            'max_amortization_mode.in' => 'Invalid amortization mode',
            'max_amortization_formula.required' => 'Formula is required for CUSTOM mode',
            'max_amortization.required' => 'Maximum amortization is required for FIXED mode',
            'typecodes.required' => 'At least one loan type is required',
            'typecodes.min' => 'At least one loan type is required',
            'typecodes.*.exists' => 'One or more loan types are invalid',
        ];
    }
}
