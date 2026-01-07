<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaryRequest extends FormRequest
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
            'salary_amount' => 'required|numeric|min:0.01',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'salary_amount.required' => 'Salary amount is required',
            'salary_amount.numeric' => 'Salary amount must be a valid number',
            'salary_amount.min' => 'Salary amount must be at least 0.01',
        ];
    }
}
