<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Games extends Model
{
    use HasFactory;

    protected $table = 'games';

    // No created_at / updated_at columns
    public $timestamps = false;

    protected $fillable = [
        'type',
        'player1_user_id',
        'player2_user_id',
        'is_draw',
        'winner_user_id',
        'loser_user_id',
        'match_id',
        'status',
        'began_at',
        'ended_at',
        'total_time',
        'player1_points',
        'player2_points',
        'custom',
    ];

    protected $casts = [
        'type'             => 'string',
        'status'           => 'string',

        'player1_user_id'  => 'integer',
        'player2_user_id'  => 'integer',
        'winner_user_id'   => 'integer',
        'loser_user_id'    => 'integer',
        'match_id'         => 'integer',

        // SQLite stores this as INTEGER 0/1
        'is_draw'          => 'boolean',

        'player1_points'   => 'integer',
        'player2_points'   => 'integer',

        'total_time'       => 'float',

        'began_at'         => 'datetime',
        'ended_at'         => 'datetime',

        // TEXT column, assumed JSON
        'custom'           => 'array',
    ];

    public function player1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player1_user_id');
    }
    public function winner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'winner_user_id');
    }

    public function player2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player2_user_id');
    }
    public function loser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'loser_user_id');
    }
}
