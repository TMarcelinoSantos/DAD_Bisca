<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSingleMatchesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'player1_user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'winner_user_id' => ['sometimes', 'integer', 'exists:users,id', 'nullable'],
            'type' => ['sometimes', Rule::in(['3', '9'])],
            'status' => ['sometimes', Rule::in(['PE', 'PL', 'E', 'I'])],
            'stake' => ['sometimes', 'integer'],
            'began_at' => ['sometimes', 'nullable', 'date'],
            'ended_at' => ['sometimes', 'nullable', 'date'],
            'total_time' => ['sometimes', 'nullable', 'numeric'],
            'player1_marks' => ['sometimes', 'nullable', 'integer'],
            'opponent_marks' => ['sometimes', 'nullable', 'integer'],
        ];
    }
}