<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\MultiplayerGameController;
use App\Models\User;
use App\Models\CoinTransaction;
use App\Models\CoinTransactionType;

class MultiplayerGameControllerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return MultiplayerGameController::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'             => 'nullable|in:3,9',
            'player1_user_id'  => 'required|exists:users,id',
            'player2_user_id'  => 'required|exists:users,id',
            'is_draw'          => 'sometimes|boolean',
            'winner_user_id'   => 'nullable|exists:users,id',
            'loser_user_id'    => 'nullable|exists:users,id',
            'match_id'         => 'nullable|exists:matches,id',
            'status'           => 'required|in:Pending,Playing,Ended,Interrupted',
            'began_at'         => 'nullable|date',
            'ended_at'         => 'nullable|date',
            'total_time'       => 'nullable|numeric',
            'player1_points'   => 'nullable|integer',
            'player2_points'   => 'nullable|integer',
            'custom'           => 'nullable|array',
        ]);

        $game = null;

        DB::transaction(function () use (&$game, $validated) {
            $game = MultiplayerGameController::create($validated);

            $winnerId = $game->winner_user_id;

            if (!$winnerId) {
                return; // no winner, no payout
            }

            $winner = User::find($winnerId);
            if (!$winner) {
                return; // safety guard
            }

            // Determine winner points based on which seat they occupied
            $winnerPoints = null;
            if ($winnerId === $game->player1_user_id) {
                $winnerPoints = $game->player1_points;
            } elseif ($winnerId === $game->player2_user_id) {
                $winnerPoints = $game->player2_points;
            }

            if ($winnerPoints === null) {
                return;
            }

            // Determine payout based on Bisca scoring
            $reward = 0;
            $payoutKind = null; // 'basic' | 'capote' | 'bandeira'

            if ($winnerPoints >= 120) {
                $reward = 6;
                $payoutKind = 'bandeira';
            } elseif ($winnerPoints >= 91) {
                $reward = 4;
                $payoutKind = 'capote';
            } elseif ($winnerPoints >= 61) {
                $reward = 3;
                $payoutKind = 'basic';
            }

            if ($reward <= 0) {
                return; // winner did not reach minimum points for payout
            }

            $type = CoinTransactionType::firstOrCreate([
                'name' => 'Game payout',
                'type' => 'C',
            ]);

            CoinTransaction::create([
                'transaction_datetime'     => now(),
                'user_id'                  => $winner->id,
                'game_id'                  => $game->id,
                'coin_transaction_type_id' => $type->id,
                'coins'                    => $reward,
                'custom'                   => [
                    'context'       => 'multiplayer_game_payout',
                    'payout_kind'   => $payoutKind,
                    'winner_points' => $winnerPoints,
                ],
            ]);

            $winner->increment('coins_balance', $reward);
        });

        // Ensure we return the (possibly refreshed) game instance
        return response()->json($game, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $game = MultiplayerGameController::findOrFail($id);

        return $game;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $game = MultiplayerGameController::findOrFail($id);

        $validated = $request->validate([
            'type'             => 'nullable|in:3,9',
            'player1_user_id'  => 'sometimes|exists:users,id',
            'player2_user_id'  => 'sometimes|exists:users,id',
            'is_draw'          => 'sometimes|boolean',
            'winner_user_id'   => 'nullable|exists:users,id',
            'loser_user_id'    => 'nullable|exists:users,id',
            'match_id'         => 'nullable|exists:matches,id',
            'status'           => 'sometimes|in:Pending,Playing,Ended,Interrupted',
            'began_at'         => 'nullable|date',
            'ended_at'         => 'nullable|date',
            'total_time'       => 'nullable|numeric',
            'player1_points'   => 'nullable|integer',
            'player2_points'   => 'nullable|integer',
            'custom'           => 'nullable|array',
        ]);

        $game->update($validated);

        return $game;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $game = MultiplayerGameController::findOrFail($id);
        $game->delete();

        return response()->noContent();
    }
}
