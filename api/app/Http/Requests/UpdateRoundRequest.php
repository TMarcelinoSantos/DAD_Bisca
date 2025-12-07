<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'single_game_id' => [
                'required',
                'integer',
                Rule::unique('users')->ignore($this->user)
            ],
            'winner_user_id' => [
                'sometimes', 
                'intiger',
                Rule::unique('users')->ignore($this->user)
            ],
            'round_number' => ['sometimes','nullable', 'integer'],
            'player_hand' => ['sometimes','nullable', 'array'],
            'opponent_hand' => ['sometimes','nullable', 'array'],
            'trump_card' => ['sometimes','nullable', 'string'],
            'deck_cards' => ['sometimes','nullable', 'array'],
            'played_cards' => ['sometimes','nullable', 'array'],
            'player_cards_won' => ['sometimes','nullable', 'array'],
            'opponent_cards_won' => ['sometimes','nullable', 'array'],
            'winner_user_id' => ['sometimes','nullable', 'integer'],
            'player_points' => ['sometimes','nullable', 'integer'],
            'opponent_points' => ['sometimes','nullable', 'integer'],
        ];
    }
}