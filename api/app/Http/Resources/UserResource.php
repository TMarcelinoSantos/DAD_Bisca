<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
        'nickname' => $this->nickname,
        'name' => $this->name,
        'email' => $this->email,
        'photo_avatar_filename' => $this->photo_avatar_filename,
        'avatar' => $this->photo_avatar_filename,
        'type' => $this->type,
        'blocked' => $this->blocked,
        'coins_balance' => $this->coins_balance,
        'card_theme' => $this->card_theme,
        ];
    }
}