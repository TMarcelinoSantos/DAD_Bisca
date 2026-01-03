<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Matches;
use App\Models\User;
use App\Models\CoinTransaction;
use App\Models\CoinTransactionType;

class MatchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Matches::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'             => 'required|in:3,9',
            'player1_user_id'  => 'required|exists:users,id',
            'player2_user_id'  => 'required|exists:users,id',
            'winner_user_id'   => 'required|exists:users,id',
            'loser_user_id'    => 'required|exists:users,id',
            'status'           => 'required|in:Pending,Playing,Ended,Interrupted',
            'stake'            => 'required|integer|min:1|max:100',
            'began_at'         => 'nullable|date',
            'ended_at'         => 'nullable|date',
            'total_time'       => 'nullable|numeric',
            'player1_marks'    => 'nullable|integer',
            'player2_marks'    => 'nullable|integer',
            'player1_points'   => 'nullable|integer',
            'player2_points'   => 'nullable|integer',
            'custom'           => 'nullable|array',
        ]);

        $match = DB::transaction(function () use ($validated) {
            $match = Matches::create($validated);

            // Payout logic: winner receives both stakes minus 1 coin.
            $stake = $match->stake;
            $payout = max(0, 2 * $stake - 1);

            if ($payout > 0 && $match->winner_user_id) {
                $winner = User::find($match->winner_user_id);
                if ($winner) {
                    $type = CoinTransactionType::firstOrCreate([
                        'name' => 'Match payout',
                        'type' => 'C',
                    ]);

                    CoinTransaction::create([
                        'transaction_datetime'     => now(),
                        'user_id'                  => $winner->id,
                        'match_id'                 => $match->id,
                        'coin_transaction_type_id' => $type->id,
                        'coins'                    => $payout,
                        'custom'                   => [
                            'context' => 'multiplayer_match_payout',
                            'stake'   => $stake,
                        ],
                    ]);

                    $winner->increment('coins_balance', $payout);
                }
            }

            return $match;
        });

        return response()->json($match, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Matches $match)
    {
        return $match;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Matches $match)
    {
        $validated = $request->validate([
            'type'             => 'sometimes|in:3,9',
            'player1_user_id'  => 'sometimes|exists:users,id',
            'player2_user_id'  => 'sometimes|nullable|exists:users,id',
            'winner_user_id'   => 'sometimes|nullable|exists:users,id',
            'loser_user_id'    => 'sometimes|nullable|exists:users,id',
            'status'           => 'sometimes|in:Pending,Playing,Ended,Interrupted',
            'stake'            => 'sometimes|nullable|integer',
            'began_at'         => 'sometimes|nullable|date',
            'ended_at'         => 'sometimes|nullable|date',
            'total_time'       => 'sometimes|nullable|numeric',
            'player1_marks'    => 'sometimes|nullable|integer',
            'player2_marks'    => 'sometimes|nullable|integer',
            'player1_points'   => 'sometimes|nullable|integer',
            'player2_points'   => 'sometimes|nullable|integer',
            'custom'           => 'sometimes|nullable|array',
        ]);

        $match->update($validated);

        return $match;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Matches $match)
    {
        $match->delete();

        return response()->noContent();
    }
}
