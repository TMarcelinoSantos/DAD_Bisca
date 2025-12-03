<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoundResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
        'single_match_id' => $this->single_match_id,
        'round_number' => $this->round_number,
        'player_hand' => $this->player_hand,
        'opponent_hand' => $this->opponent_hand,
        'trump_card' => $this->trump_card,
        'deck_cards' => $this->deck_cards,
        'played_cards' => $this->played_cards,
        'winner_user_id' => $this->trump_card,
        'player_points' => $this->deck_cards,
        'opponent_points' => $this->played_cards,
        ];
    }
}