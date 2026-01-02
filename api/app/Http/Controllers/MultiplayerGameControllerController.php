<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MultiplayerGameController;

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

        $game = MultiplayerGameController::create($validated);

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
