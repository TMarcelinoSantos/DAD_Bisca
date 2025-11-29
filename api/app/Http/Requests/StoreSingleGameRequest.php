<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSingleGameRequest extends FormRequest
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
            'player1_user_id' => [
                'sometimes',
                'integer',
                'exists:users,id',
            ],
            'type' => ['required', Rule::in(['3', '9'])],
            'status' => ['required', Rule::in(['PE', 'PL', 'E', 'I'])],
            'player_points' => ['nullable', 'integer'],
            'bot_points' => ['nullable', 'integer'],
            'began_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
            'total_time' => ['nullable', 'integer'],
        ];
    }

    /**
     * Get the validation messages for invalid fields.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'player1_user_id.integer' => 'Creator ID must be an integer.',
            'player1_user_id.exists' => 'The selected player does not exist.',
            'type.required' => 'Game type is required.',
            'type.in' => 'Game type must be either 3 (Three-card hands) or 9 (Nine-card hands).',
            'status.required' => 'Game status is required.',
            'status.in' => 'Game status must be on of: PE - PEnding , PL - PLaying, E - Ended, I - Interrupted ',
        ];
    }
}