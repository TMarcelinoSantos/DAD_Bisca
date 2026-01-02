<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Games as Game;
use App\Models\Matches as MatchModel;
use App\Models\User;
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
}
