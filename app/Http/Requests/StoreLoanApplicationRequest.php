<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanApplicationRequest extends FormRequest
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
            'product_id' => 'required|exists:wln_products,product_id',
            'term_months' => 'required|integer|min:1',
            'amortization' => 'required|numeric|min:0',
            'old_balance' => 'required|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Please select a loan product',
            'product_id.exists' => 'The selected product is invalid',
            'term_months.required' => 'Term in months is required',
            'term_months.integer' => 'Term must be a valid number',
            'term_months.min' => 'Term must be at least 1 month',
            'amortization.required' => 'Amortization amount is required',
            'amortization.numeric' => 'Amortization must be a valid number',
            'amortization.min' => 'Amortization cannot be negative',
            'old_balance.required' => 'Old balance is required',
            'old_balance.numeric' => 'Old balance must be a valid number',
            'old_balance.min' => 'Old balance cannot be negative',
        ];
    }
}
