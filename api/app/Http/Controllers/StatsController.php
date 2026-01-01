<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Games as Game;
use App\Models\Matches as MatchModel;

class StatsController extends Controller
{
    /**
     * Get personal stats for the authenticated user.
     * 
     * Returns:
     * - Total game wins
     * - Total match wins
     * - Total capotes (>91 points in games)
     * - Total bandeiras (120 points in games)
     * - Segmented stats by game/match type
     */
    public function personalStats(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Game wins (where user is winner)
        $gameWins = Game::where('winner_user_id', $user->id)->count();

        // Match wins (where user is winner)
        $matchWins = MatchModel::where('winner_user_id', $user->id)->count();

        // Capotes (>91 points)
        $capotes = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->whereRaw('player1_points >= 91')
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('player2_user_id', $user->id)
                     ->whereRaw('player2_points >= 91');
              });
        })->count();

        // Bandeiras (120 points)
        $bandeiras = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->where('player1_points', 120)
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('player2_user_id', $user->id)
                     ->where('player2_points', 120);
              });
        })->count();

        // Total games played
        $totalGamesPlayed = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })->count();

        // Total matches played
        $totalMatchesPlayed = MatchModel::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })->count();

        // Game draw count
        $gameDraws = Game::where('is_draw', true)
            ->where(function ($q) use ($user) {
                $q->where('player1_user_id', $user->id)
                  ->orWhere('player2_user_id', $user->id);
            })
            ->count();

        // Win rate
        $gameWinRate = $totalGamesPlayed > 0 ? round(($gameWins / $totalGamesPlayed) * 100, 2) : 0;
        $matchWinRate = $totalMatchesPlayed > 0 ? round(($matchWins / $totalMatchesPlayed) * 100, 2) : 0;

        // Stats by game type
        $gamesByType = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })
            ->selectRaw('type, COUNT(*) as total, SUM(CASE WHEN winner_user_id = ? THEN 1 ELSE 0 END) as wins', [$user->id])
            ->groupBy('type')
            ->get();

        // Stats by match type
        $matchesByType = MatchModel::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })
            ->selectRaw('type, COUNT(*) as total, SUM(CASE WHEN winner_user_id = ? THEN 1 ELSE 0 END) as wins', [$user->id])
            ->groupBy('type')
            ->get();

        // Capotes by type
        $capotesByType = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->whereRaw('player1_points >= 91')
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('player2_user_id', $user->id)
                     ->whereRaw('player2_points >= 91');
              });
        })
            ->selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->get();

        // Bandeiras by type
        $bandeirasByType = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->where('player1_points', 120)
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('player2_user_id', $user->id)
                     ->where('player2_points', 120);
              });
        })
            ->selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->get();

        return response()->json([
            'user' => [
                'id'   => $user->id,
                'name' => $user->name,
            ],
            'overall' => [
                'game_wins'         => $gameWins,
                'game_losses'       => $totalGamesPlayed - $gameWins - $gameDraws,
                'game_draws'        => $gameDraws,
                'total_games'       => $totalGamesPlayed,
                'game_win_rate'     => $gameWinRate,
                'match_wins'        => $matchWins,
                'match_losses'      => $totalMatchesPlayed - $matchWins,
                'total_matches'     => $totalMatchesPlayed,
                'match_win_rate'    => $matchWinRate,
                'total_capotes'     => $capotes,
                'total_bandeiras'   => $bandeiras,
            ],
            'by_game_type' => [
                'games'      => $gamesByType->map(function ($g) {
                    return [
                        'type'     => $g->type,
                        'total'    => $g->total,
                        'wins'     => $g->wins,
                        'win_rate' => $g->total > 0 ? round(($g->wins / $g->total) * 100, 2) : 0,
                    ];
                }),
                'capotes'    => $capotesByType,
                'bandeiras'  => $bandeirasByType,
            ],
            'by_match_type' => [
                'matches'    => $matchesByType->map(function ($m) {
                    return [
                        'type'     => $m->type,
                        'total'    => $m->total,
                        'wins'     => $m->wins,
                        'win_rate' => $m->total > 0 ? round(($m->wins / $m->total) * 100, 2) : 0,
                    ];
                }),
            ],
        ]);
    }
}