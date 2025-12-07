<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoundRequest extends FormRequest
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
            'single_game_id' => [
                'required',
                'integer',
                'exists:games_single,id',
            ],
            'round_number' => ['nullable', 'integer'],
            'player_hand' => ['nullable', 'array'],
            'opponent_hand' => ['nullable', 'array'],
            'trump_card' => ['nullable', 'string'],
            'deck_cards' => ['nullable', 'array'],
            'played_cards' => ['nullable', 'array'],
            'winner_user_id' => ['nullable', 'integer'],
            'player_points' => ['nullable', 'integer'],
            'opponent_points' => ['nullable', 'integer'],
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
            'player_hand.array' => 'Player Hand should has an array of cards'
        ];
    }
}
