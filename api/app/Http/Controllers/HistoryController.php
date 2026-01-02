<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Games as Game;
use App\Models\Matches as MatchModel;
use App\Models\User;

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

        // Base queries with eager loading of player relations
        $matchesQuery = MatchModel::with([
            'player1:id,name,nickname',
            'player2:id,name,nickname',
            'winner:id,name,nickname',
            'loser:id,name,nickname',
        ]);

        $gamesQuery = Game::with([
            'player1:id,name,nickname',
            'player2:id,name,nickname',
            'winner:id,name,nickname',
            'loser:id,name,nickname',
        ])->whereNull('match_id');

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

        $matches = $matchesQuery->orderBy('began_at', 'desc')->get();
        $games   = $gamesQuery->orderBy('began_at', 'desc')->get();

        return response()->json([
            'matches' => $matches,
            'games'   => $games,
        ]);
    }

    /**
     * Get a specific match with all its games for the authenticated user.
     */
    public function showMatch(Request $request, $matchId)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Fetch the match with eager loading
        $match = MatchModel::with([
            'player1:id,name,nickname',
            'player2:id,name,nickname',
            'winner:id,name,nickname',
            'loser:id,name,nickname',
        ])->find($matchId);

        if (! $match) {
            return response()->json(['message' => 'Match not found.'], 404);
        }

        // Check if user is allowed to view this match
        $canViewAll = ($user->type === 'A');
        if (! $canViewAll) {
            $isParticipant = $match->player1_user_id === $user->id ||
                             $match->player2_user_id === $user->id ||
                             $match->winner_user_id === $user->id ||
                             $match->loser_user_id === $user->id;

            if (! $isParticipant) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        // Fetch all games that belong to this match
        $games = Game::with([
            'player1:id,name,nickname',
            'player2:id,name,nickname',
            'winner:id,name,nickname',
            'loser:id,name,nickname',
        ])
            ->where('match_id', $matchId)
            ->orderBy('began_at', 'asc')
            ->get();

        return response()->json([
            'match' => $match,
            'games' => $games,
        ]);
    }

    /**
     * Admin-only: return history for a specific user.
     */
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

        // Matches for the requested user (with relations)
        $matches = MatchModel::with([
                'player1:id,name,nickname',
                'player2:id,name,nickname',
                'winner:id,name,nickname',
                'loser:id,name,nickname',
            ])
            ->where(function ($q) use ($user) {
                $q->where('player1_user_id', $user->id)
                  ->orWhere('player2_user_id', $user->id)
                  ->orWhere('winner_user_id', $user->id)
                  ->orWhere('loser_user_id', $user->id);
            })
            ->orderBy('began_at', 'desc')
            ->get();

        // Standalone games (no match_id) for the requested user (with relations)
        $games = Game::with([
                'player1:id,name,nickname',
                'player2:id,name,nickname',
                'winner:id,name,nickname',
                'loser:id,name,nickname',
            ])
            ->whereNull('match_id')
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
                'id'       => $user->id,
                'name'     => $user->name,
                'nickname' => $user->nickname,
            ],
            'matches' => $matches,
            'games'   => $games,
        ]);
    }
}
