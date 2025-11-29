<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SingleGame extends Model
{
    protected $table = 'games_single';

    protected $fillable = [
        'player1_user_id',
        'winner_user_id',
        'type',
        'status',
        'began_at',
        'ended_at',
        'total_time',
        'player_points',
        'bot_points',
    ];

    public function player1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player1_user_id');
    }
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }
}