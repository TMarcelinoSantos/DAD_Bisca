<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Games as Game;
use App\Models\Matches as MatchModel;
use App\Models\User;
use App\Models\CoinPurchase;
use App\Models\CoinTransaction;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Get generic anonymized statistics for public view.
     * 
     * Returns:
     * - Total registered players
     * - Total games and matches played
     * - Recent activity (games/matches per day for last 30 days)
     * - Average game duration
     * - Most popular game types
     * - Total capotes and bandeiras
     */
    public function index(Request $request)
    {
        // Total registered players (not deleted)
        $totalPlayers = User::whereNull('deleted_at')->count();

        // Total games and matches
        $totalGames = Game::count();
        $totalMatches = MatchModel::count();

        // Completed games and matches
        $completedGames = Game::where('status', 'completed')->count();
        $completedMatches = MatchModel::where('status', 'completed')->count();

        // Average game duration (only completed games)
        $avgGameDuration = Game::where('status', 'completed')
            ->whereNotNull('total_time')
            ->avg('total_time');

        // Average match duration (only completed matches)
        $avgMatchDuration = MatchModel::where('status', 'completed')
            ->whereNotNull('total_time')
            ->avg('total_time');

        // Games per day for last 30 days
        $gamesPerDay = Game::selectRaw('DATE(began_at) as date, COUNT(*) as count')
            ->whereNotNull('began_at')
            ->where('began_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Matches per day for last 30 days
        $matchesPerDay = MatchModel::selectRaw('DATE(began_at) as date, COUNT(*) as count')
            ->whereNotNull('began_at')
            ->where('began_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Most popular game types
        $gameTypeStats = Game::selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->orderBy('total', 'desc')
            ->get();

        // Most popular match types
        $matchTypeStats = MatchModel::selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->orderBy('total', 'desc')
            ->get();

        // Total capotes (>= 91 points)
        $totalCapotes = Game::where(function ($q) {
            $q->whereRaw('player1_points >= 91')
              ->orWhereRaw('player2_points >= 91');
        })->count();

        // Total bandeiras (120 points)
        $totalBandeiras = Game::where(function ($q) {
            $q->where('player1_points', 120)
              ->orWhere('player2_points', 120);
        })->count();

        // Total draws
        $totalDraws = Game::where('is_draw', true)->count();

        // Games by status
        $gamesByStatus = Game::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });

        // Matches by status
        $matchesByStatus = MatchModel::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });

        return response()->json([
            'players' => [
                'total' => $totalPlayers,
            ],
            'games' => [
                'total'       => $totalGames,
                'completed'   => $completedGames,
                'ongoing'     => $gamesByStatus['ongoing'] ?? 0,
                'pending'     => $gamesByStatus['pending'] ?? 0,
                'cancelled'   => $gamesByStatus['cancelled'] ?? 0,
                'avg_duration' => round($avgGameDuration ?? 0, 2),
            ],
            'matches' => [
                'total'       => $totalMatches,
                'completed'   => $completedMatches,
                'ongoing'     => $matchesByStatus['ongoing'] ?? 0,
                'pending'     => $matchesByStatus['pending'] ?? 0,
                'cancelled'   => $matchesByStatus['cancelled'] ?? 0,
                'avg_duration' => round($avgMatchDuration ?? 0, 2),
            ],
            'achievements' => [
                'total_capotes'   => $totalCapotes,
                'total_bandeiras' => $totalBandeiras,
                'total_draws'     => $totalDraws,
            ],
            'activity' => [
                'games_per_day'   => $gamesPerDay,
                'matches_per_day' => $matchesPerDay,
            ],
            'popularity' => [
                'game_types'  => $gameTypeStats,
                'match_types' => $matchTypeStats,
            ],
        ]);
    }

    
    /**
     * Get detailed statistics for a specific user (Admin only)
     */
    public function userStatistics(Request $request, User $user)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Admin check
        if ($authUser->type !== 'A') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Game statistics
        $totalGames = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })->count();

        $gameWins = Game::where('winner_user_id', $user->id)->count();
        $gameLosses = Game::where('loser_user_id', $user->id)->count();
        $gameDraws = Game::where('is_draw', true)
            ->where(function ($q) use ($user) {
                $q->where('player1_user_id', $user->id)
                  ->orWhere('player2_user_id', $user->id);
            })->count();

        // Match statistics
        $totalMatches = MatchModel::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })->count();

        $matchWins = MatchModel::where('winner_user_id', $user->id)->count();
        $matchLosses = MatchModel::where('loser_user_id', $user->id)->count();

        // Achievements
        $capotes = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->where('player1_points', '>=', 91)
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('player2_user_id', $user->id)
                     ->where('player2_points', '>=', 91);
              });
        })->count();

        $bandeiras = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->where('player1_points', 120)
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('player2_user_id', $user->id)
                     ->where('player2_points', 120);
              });
        })->count();

        // Coin transactions
        $totalCoinsEarned = CoinTransaction::where('user_id', $user->id)
            ->where('coins', '>', 0)
            ->sum('coins');

        $totalCoinsSpent = CoinTransaction::where('user_id', $user->id)
            ->where('coins', '<', 0)
            ->sum('coins');

        // Coin purchases
        $totalPurchases = CoinPurchase::where('user_id', $user->id)->count();
        $totalEurosSpent = CoinPurchase::where('user_id', $user->id)->sum('euros');

        // Time series data (last 90 days)
        $ninetyDaysAgo = now()->subDays(90);

        $gamesOverTime = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })
            ->where('began_at', '>=', $ninetyDaysAgo)
            ->selectRaw('DATE(began_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $matchesOverTime = MatchModel::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })
            ->where('began_at', '>=', $ninetyDaysAgo)
            ->selectRaw('DATE(began_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $purchasesOverTime = CoinPurchase::where('user_id', $user->id)
            ->where('purchase_datetime', '>=', $ninetyDaysAgo)
            ->selectRaw('DATE(purchase_datetime) as date, COUNT(*) as count, SUM(euros) as total_euros')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Stats by type
        $gamesByType = Game::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })
            ->selectRaw('type, COUNT(*) as total, SUM(CASE WHEN winner_user_id = ? THEN 1 ELSE 0 END) as wins', [$user->id])
            ->groupBy('type')
            ->get();

        $matchesByType = MatchModel::where(function ($q) use ($user) {
            $q->where('player1_user_id', $user->id)
              ->orWhere('player2_user_id', $user->id);
        })
            ->selectRaw('type, COUNT(*) as total, SUM(CASE WHEN winner_user_id = ? THEN 1 ELSE 0 END) as wins', [$user->id])
            ->groupBy('type')
            ->get();

        return response()->json([
            'user' => [
                'id'            => $user->id,
                'name'          => $user->name,
                'nickname'      => $user->nickname,
                'email'         => $user->email,
                'type'          => $user->type,
                'coins_balance' => $user->coins_balance,
                'blocked'       => $user->blocked,
            ],
            'games' => [
                'total'      => $totalGames,
                'wins'       => $gameWins,
                'losses'     => $gameLosses,
                'draws'      => $gameDraws,
                'win_rate'   => $totalGames > 0 ? round(($gameWins / $totalGames) * 100, 2) : 0,
            ],
            'matches' => [
                'total'      => $totalMatches,
                'wins'       => $matchWins,
                'losses'     => $matchLosses,
                'win_rate'   => $totalMatches > 0 ? round(($matchWins / $totalMatches) * 100, 2) : 0,
            ],
            'achievements' => [
                'capotes'    => $capotes,
                'bandeiras'  => $bandeiras,
            ],
            'coins' => [
                'current_balance' => $user->coins_balance,
                'total_earned'    => $totalCoinsEarned,
                'total_spent'     => abs($totalCoinsSpent),
                'net_change'      => $totalCoinsEarned + $totalCoinsSpent,
            ],
            'purchases' => [
                'total_count'     => $totalPurchases,
                'total_euros'     => round($totalEurosSpent, 2),
            ],
            'time_series' => [
                'games'     => $gamesOverTime,
                'matches'   => $matchesOverTime,
                'purchases' => $purchasesOverTime,
            ],
            'by_type' => [
                'games'   => $gamesByType->map(function ($g) {
                    return [
                        'type'     => $g->type,
                        'total'    => $g->total,
                        'wins'     => $g->wins,
                        'win_rate' => $g->total > 0 ? round(($g->wins / $g->total) * 100, 2) : 0,
                    ];}),
                'matches' => $matchesByType->map(function ($m) {
                    return [
                        'type'     => $m->type,
                        'total'    => $m->total,
                        'wins'     => $m->wins,
                        'win_rate' => $m->total > 0 ? round(($m->wins / $m->total) * 100, 2) : 0,
                    ];}
                ),
            ],
        ]);
    }

    /**
     * Get list of all users for admin dropdown (Admin only)
     */
    public function getUsersList(Request $request)
    {
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Admin check
        if ($authUser->type !== 'A') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $users = User::select('id', 'name', 'nickname', 'email', 'type', 'blocked')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }
}
