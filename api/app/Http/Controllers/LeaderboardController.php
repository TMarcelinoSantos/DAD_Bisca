<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Games as Game;
use App\Models\Matches as MatchModel;
use App\Models\User;

class LeaderboardController extends Controller
{
    /**
     * Get global leaderboards for games and matches.
     * 
     * Returns top players by:
     * - Game wins
     * - Match wins
     * - Capotes
     * - Bandeiras
     * 
     * In case of ties, earlier achiever ranks higher (by earliest game/match date)
     */
    public function global(Request $request)
    {
        $perPage = $request->query('limit', 5);

        // Game wins leaderboard
        $gameWinsLeaderboard = User::select('users.id', 'users.nickname', 'users.name')
            ->selectRaw('COUNT(games.id) as total_wins')
            ->selectRaw('MIN(games.began_at) as first_win_at')
            ->leftJoin('games', function ($join) {
                $join->on('users.id', '=', 'games.winner_user_id');
            })
            ->groupBy('users.id', 'users.nickname', 'users.name')
            ->havingRaw('COUNT(games.id) > 0')
            ->orderByRaw('total_wins DESC, first_win_at ASC')
            ->paginate($perPage, ['*'], 'game_wins_page');

        // Match wins leaderboard
        $matchWinsLeaderboard = User::select('users.id', 'users.nickname', 'users.name')
            ->selectRaw('COUNT(matches.id) as total_wins')
            ->selectRaw('MIN(matches.began_at) as first_win_at')
            ->leftJoin('matches', function ($join) {
                $join->on('users.id', '=', 'matches.winner_user_id');
            })
            ->groupBy('users.id', 'users.nickname', 'users.name')
            ->havingRaw('COUNT(matches.id) > 0')
            ->orderByRaw('total_wins DESC, first_win_at ASC')
            ->paginate($perPage, ['*'], 'match_wins_page');

        // Capotes leaderboard
        $capotesLeaderboard = User::select('users.id', 'users.nickname', 'users.name')
            ->selectRaw('COUNT(games.id) as total_capotes')
            ->selectRaw('MIN(games.began_at) as first_capote_at')
            ->leftJoin('games', function ($join) {
                $join->on(function ($q) {
                    $q->on('users.id', '=', 'games.player1_user_id')
                      ->whereRaw('games.player1_points >= 91');
                })
                ->orOn(function ($q) {
                    $q->on('users.id', '=', 'games.player2_user_id')
                      ->whereRaw('games.player2_points >= 91');
                });
            })
            ->groupBy('users.id', 'users.nickname', 'users.name')
            ->havingRaw('COUNT(games.id) > 0')
            ->orderByRaw('total_capotes DESC, first_capote_at ASC')
            ->paginate($perPage, ['*'], 'capotes_page');

        // Bandeiras leaderboard
        $bandeiraLeaderboard = User::select('users.id', 'users.nickname', 'users.name')
            ->selectRaw('COUNT(games.id) as total_bandeiras')
            ->selectRaw('MIN(games.began_at) as first_bandeira_at')
            ->leftJoin('games', function ($join) {
                $join->on(function ($q) {
                    $q->on('users.id', '=', 'games.player1_user_id')
                      ->where('games.player1_points', 120);
                })
                ->orOn(function ($q) {
                    $q->on('users.id', '=', 'games.player2_user_id')
                      ->where('games.player2_points', 120);
                });
            })
            ->groupBy('users.id', 'users.nickname', 'users.name')
            ->havingRaw('COUNT(games.id) > 0')
            ->orderByRaw('total_bandeiras DESC, first_bandeira_at ASC')
            ->paginate($perPage, ['*'], 'bandeiras_page');

        // Transform to include ranking in data
        $gameWinsLeaderboard->getCollection()->transform(function ($user) {
            return [
                'id'         => $user->id,
                'nickname'   => $user->nickname,
                'name'       => $user->name,
                'total'      => $user->total_wins,
                'first_at'   => $user->first_win_at,
            ];
        });

        $matchWinsLeaderboard->getCollection()->transform(function ($user) {
            return [
                'id'         => $user->id,
                'nickname'   => $user->nickname,
                'name'       => $user->name,
                'total'      => $user->total_wins,
                'first_at'   => $user->first_win_at,
            ];
        });

        $capotesLeaderboard->getCollection()->transform(function ($user) {
            return [
                'id'         => $user->id,
                'nickname'   => $user->nickname,
                'name'       => $user->name,
                'total'      => $user->total_capotes,
                'first_at'   => $user->first_capote_at,
            ];
        });

        $bandeiraLeaderboard->getCollection()->transform(function ($user) {
            return [
                'id'         => $user->id,
                'nickname'   => $user->nickname,
                'name'       => $user->name,
                'total'      => $user->total_bandeiras,
                'first_at'   => $user->first_bandeira_at,
            ];
        });

        return response()->json([
            'game_wins'   => $gameWinsLeaderboard,
            'match_wins'  => $matchWinsLeaderboard,
            'capotes'     => $capotesLeaderboard,
            'bandeiras'   => $bandeiraLeaderboard,
        ]);
    }
}