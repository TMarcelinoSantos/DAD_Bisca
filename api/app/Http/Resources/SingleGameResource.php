<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SingleGameResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'player1_user_id' => $this->player1_user_id, 
            'winner_user_id' => $this->winner_user_id,  
            'type' => $this->type,
            'is_draw' => $this->is_draw,
            'status' => $this->status,
            'player_points' => $this->player_points,
            'bot_points' => $this->bot_points,
            'began_at' => $this->began_at,
            'ended_at' => $this->ended_at,
            'total_time' => $this->total_time,
            'match_id' => $this->match_id,
        ];
    }
}
