<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CoinsController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'value' => 'required|integer|min:1|max:99',
            'coins' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        if ($request->coins !== $request->value * 10) {
            return response()->json([
                'message' => 'Invalid coin conversion'
            ], 422);
        }

        $user->coins_balance += $request->coins;
        $user->save();

        return response()->json([
            'message' => 'Coins added successfully',
            'coins_balance' => $user->coins_balance,
        ], 200);
    }
}
