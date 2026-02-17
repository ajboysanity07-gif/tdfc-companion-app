<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class LoginAppUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'login' => [
                'required',
                'string',
                'min:3',
                'max:255',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $valueString = (string) $value;
                    $isEmail = filter_var($valueString, FILTER_VALIDATE_EMAIL) !== false;
                    $isUsername = (bool) preg_match('/^[A-Za-z0-9._-]+$/', $valueString);

                    if (! $isEmail && ! $isUsername) {
                        $fail('Please enter a valid email or username (letters, numbers, dots, underscores, or hyphens).');
                    }
                },
            ],
            'password' => 'required|string|min:8',
            'remember' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'login.required' => 'Email or username is required.',
            'login.min' => 'Email or username must be at least 3 characters.',
            'login.max' => 'Email or username must not exceed 255 characters.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
        ];
    }
}
