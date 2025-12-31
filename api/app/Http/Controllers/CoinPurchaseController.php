<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CoinTransaction;
use App\Models\CoinPurchase;

class CoinPurchaseController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'euros' => 'required|integer|min:1|max:99',
            'coins' => 'required|integer|min:1',
            'payment_type' => 'required|in:MBWAY,PAYPAL,IBAN,MB,VISA',
            'payment_reference' => 'required|string',
        ]);

        if ($data['coins'] !== $data['euros'] * 10) {
            return response()->json([
                'message' => 'Invalid coin conversion'
            ], 422);
        }

        $user = $request->user();

        return DB::transaction(function () use ($data, $user) {

            $transaction = CoinTransaction::create([
                'transaction_datetime' => now(),
                'user_id' => $user->id,
                'coin_transaction_type_id' => 2,
                'coins' => $data['coins'],
            ]);

            CoinPurchase::create([
                'purchase_datetime' => now(),
                'user_id' => $user->id,
                'coin_transaction_id' => $transaction->id,
                'euros' => $data['euros'],
                'payment_type' => $data['payment_type'],
                'payment_reference' => $data['payment_reference'],
            ]);

            $user->increment('coins_balance', $data['coins']);

            return response()->json([
                'message' => 'Coins purchased successfully',
                'coins_balance' => $user->coins_balance,
            ], 201);
        });
    }
}
