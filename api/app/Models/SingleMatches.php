<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class SingleMatches extends Model
{
    protected $table = 'single_matches';

    protected $fillable = [
        'player1_user_id',
        'winner_user_id',
        'type',
        'status',
        'stake',
        'began_at',
        'ended_at',
        'total_time',
        'player1_marks',
        'opponent_marks',
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
