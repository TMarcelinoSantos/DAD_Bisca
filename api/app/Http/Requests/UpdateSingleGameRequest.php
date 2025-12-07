<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSingleGameRequest extends FormRequest
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
            'is_draw' => ['sometimes', Rule::in([1, 0])],
            'status' => ['sometimes', Rule::in(['PE', 'PL', 'E', 'I'])],
            'player_points' => ['sometimes', 'nullable', 'integer'],
            'bot_points' => ['sometimes', 'nullable', 'integer'],
            'began_at' => ['sometimes', 'nullable', 'date'],
            'ended_at' => ['sometimes', 'nullable', 'date'],
            'total_time' => ['sometimes', 'nullable', 'numeric'],
            'match_id' => ['sometimes', 'integer', 'exists:single_matches,id', 'nullable']
        ];
    }
}