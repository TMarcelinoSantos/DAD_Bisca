<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user= $this->route('user');
        return [
            'nickname' => [
                'sometimes', 
                'string', 
                'max:50', 
                Rule::unique('users')->ignore($user?->id)
            ],
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user?->id)
            ],
            'password' => ['sometimes', 'string', 'min:3'],
        ];
    }
}