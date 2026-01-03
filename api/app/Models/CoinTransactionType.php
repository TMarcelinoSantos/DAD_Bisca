<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CoinTransactionType extends Model
{
    use SoftDeletes;

    protected $table = 'coin_transaction_types';

    protected $fillable = [
        'name',
        'type',
        'custom',
    ];

    protected $casts = [
        'custom' => 'array',
    ];

    // This table does not have created_at/updated_at columns
    public $timestamps = false;

    public function transactions()
    {
        return $this->hasMany(CoinTransaction::class);
    }
}
