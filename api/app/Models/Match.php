<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchModel extends Model
{

    // Explicit table name (good practice here)
    protected $table = 'matches';

    // If you are NOT using created_at / updated_at
    public $timestamps = false;

    // Mass-assignable columns
    protected $fillable = [
        'type',
        'player1_user_id',
        'player2_user_id',
        'winner_user_id',
        'loser_user_id',
        'status',
        'stake',
        'began_at',
        'ended_at',
        'total_time',
        'player1_marks',
        'player2_marks',
        'player1_points',
        'player2_points',
        'custom',
    ];

    // Type casting (important for SQLite)
    protected $casts = [
        'type'            => 'string',
        'status'          => 'string',
        'stake'           => 'integer',

        'player1_user_id' => 'integer',
        'player2_user_id' => 'integer',
        'winner_user_id'  => 'integer',
        'loser_user_id'   => 'integer',

        'player1_marks'   => 'integer',
        'player2_marks'   => 'integer',
        'player1_points'  => 'integer',
        'player2_points'  => 'integer',

        'total_time'      => 'float',

        'began_at'        => 'datetime',
        'ended_at'        => 'datetime',

        'custom'          => 'array',
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
