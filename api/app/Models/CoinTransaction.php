<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CoinTransactionType;

class CoinTransaction extends Model
{
    use HasFactory;

    protected $table = 'coin_transactions';

    protected $fillable = [
        'transaction_datetime',
        'user_id',
        'match_id',
        'game_id',
        'coin_transaction_type_id',
        'coins',
        'custom',
    ];

    protected $casts = [
        'transaction_datetime' => 'datetime',
        'custom' => 'array',
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactionType()
    {
        return $this->belongsTo(CoinTransactionType::class,'coin_transaction_type_id');
    }
}
