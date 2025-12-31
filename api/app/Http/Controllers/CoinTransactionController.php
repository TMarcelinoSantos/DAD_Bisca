<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CoinTransaction;
use App\Http\Resources\CoinTransactionResource;

class CoinTransactionController extends Controller
{
    public function myTransactions(Request $request)
    {
        $user = $request->user();

        $transactions = CoinTransaction::with('transactionType')
            ->where('user_id', $user->id)
            ->orderByDesc('transaction_datetime')
            ->get();

        return CoinTransactionResource::collection($transactions);
    }
}
