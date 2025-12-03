<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\SingleGame;

class Round extends Model
{
    protected $fillable = [
        'single_game_id',
        'round_number',
        'player_hand',
        'opponent_hand',
        'trump_card',
        'deck_cards',
        'played_cards',
        'winner_user_id',
        'player_points',
        'opponent_points',
    ];

    protected $casts = [
        'player_hand' => 'array',
        'opponent_hand' => 'array',
        'deck_cards' => 'array',
        'played_cards' => 'array',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(SingleGame::class, 'single_game_id');
    }
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }
}
