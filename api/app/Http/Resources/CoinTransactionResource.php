<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoinTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'datetime' => $this->transaction_datetime?->format('Y-m-d H:i:s'),
            'coins' => $this->coins,
            'type' => [
                'id' => $this->coin_transaction_type_id,
                'name' => $this->transactionType?->name,
                'type' => $this->transactionType?->type, 
            ],
            'match_id' => $this->match_id,
            'game_id' => $this->game_id,
            'custom' => $this->custom,
        ];
    }
}
