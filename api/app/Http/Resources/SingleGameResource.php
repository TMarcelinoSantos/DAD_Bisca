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
            'player1_user_id' => new UserResource($this->player1_user_id),
            'type' => $this->type,
            'status' => $this->status,
            'player_points' => $this->player_points,
            'bot_points' => $this->bot_points,
            'total_time' => $this->total_time,
        ];
    }
}
