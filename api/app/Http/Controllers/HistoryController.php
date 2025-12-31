<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Games as Game;
use App\Models\Matches as MatchModel;

class HistoryController extends Controller
{

    /**
     * Return matches and standalone games.
     *
     * Rules:
     * - If user->type === 'A' -> return all matches and all games (matching the filters below).
     * - Otherwise return only records where the user is player1, player2, winner or loser.
     *
     * Games returned are only those with match_id IS NULL.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $canViewAll = ($user->type === 'A');

        // Base queries
        $matchesQuery = MatchModel::query();
        $gamesQuery = Game::whereNull('match_id');

        if (! $canViewAll) {
            $matchesQuery->where(function ($q) use ($user) {
                $q->where('player1_user_id', $user->id)
                  ->orWhere('player2_user_id', $user->id)
                  ->orWhere('winner_user_id', $user->id)
                  ->orWhere('loser_user_id', $user->id);
            });

            $gamesQuery->where(function ($q) use ($user) {
                $q->where('player1_user_id', $user->id)
                  ->orWhere('player2_user_id', $user->id)
                  ->orWhere('winner_user_id', $user->id)
                  ->orWhere('loser_user_id', $user->id);
            });
        }

        // Optional: eager load user relations if your models have them:
        // ->with(['player1', 'player2', 'winner', 'loser'])

        $matches = $matchesQuery->orderBy('began_at', 'desc')->get();
        $games   = $gamesQuery->orderBy('began_at', 'desc')->get();

        return response()->json([
            'matches' => $matches,
            'games'   => $games,
        ]);
    }

    public function userHistory(Request $request, User $user)
{
    $authUser = $request->user();

    if (! $authUser) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    // Admin check
    if ($authUser->type !== 'A') {
        return response()->json(['message' => 'Forbidden.'], 403);
    }

    // Matches for the requested user
    $matches = MatchModel::where(function ($q) use ($user) {
        $q->where('player1_user_id', $user->id)
          ->orWhere('player2_user_id', $user->id)
          ->orWhere('winner_user_id', $user->id)
          ->orWhere('loser_user_id', $user->id);
    })
    ->orderBy('began_at', 'desc')
    ->get();

    // Standalone games (no match_id) for the requested user
    $games = Game::whereNull('match_id')
        ->where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id)
              ->orWhere('winner_user_id', $user->id)
              ->orWhere('loser_user_id', $user->id);
        })
        ->orderBy('began_at', 'desc')
        ->get();

    return response()->json([
        'user'    => [
            'id' => $user->id,
        ],
        'matches' => $matches,
        'games'   => $games,
    ]);
}
}
