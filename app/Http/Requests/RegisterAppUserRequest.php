<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterAppUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'accntno' => 'required|string|max:6|unique:app_user_table,acctno',
            'fullname' => 'required|string|max:255',
            // Enforces exactly 11 digits and numeric only for PH
            'phoneno' => ['required', 'digits:11', 'regex:/^09\d{9}$/', 'unique:app_user_table,phone_no'],
            'email' => 'required|email|max:255|unique:app_user_table,email',
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('app_user_table', 'username'),
            ],
            'password' => 'required|string|min:8|confirmed',

            'profilepicture' => 'nullable|image|max:2048',
            'prcidphotofront' => 'nullable|image|max:2048',
            'prcidphotoback' => 'nullable|image|max:2048',
            'payslipphoto' => 'nullable|image|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'phoneno.required' => 'Phone number is required.',
            'phoneno.digits' => 'Phone number must be exactly 11 digits.',
            'phoneno.regex' => 'Phone number must start with 09 and be 11 digits long.',
            'phoneno.unique' => 'Phone number is already registered.',
            'accntno.unique' => 'Account number already exists.',
            'email.unique' => 'Email is already registered.',
            'username.required' => 'Username is required.',
            'username.min' => 'Username must be at least 3 characters.',
            'username.max' => 'Username must not exceed 30 characters.',
            'username.regex' => 'Username can only include letters, numbers, dots, underscores, or hyphens.',
            'username.unique' => 'Username is already registered.',
            'password.confirmed' => 'Password confirmation does not match.',
        ];
    }
}
