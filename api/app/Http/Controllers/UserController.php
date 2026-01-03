<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\CoinTransaction;
use App\Models\CoinTransactionType;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return UserResource::collection(User::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());
        return new UserResource($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());
        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    //Update user card theme
    public function updateTheme(Request $request)
    {
            $request->validate([
            'theme' => 'required|string',
            'price' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        $price = $request->price;
        $cardName = $request->theme;

        if ($user->coins_balance < $price) {
            return response()->json(['message' => 'Insufficient funds'], 400);
        }

        DB::transaction(function () use ($user, $price, $cardName) {

            $custom = is_array($user->custom) ? $user->custom : [];

            // Garantir array
            if (!isset($custom['owned_card_themes'])) {
                $custom['owned_card_themes'] = [];
            }

            // Evitar duplicados
            if (in_array($cardName, $custom['owned_card_themes'])) {
                abort(409, 'Theme already owned');
            }

            $user->decrement('coins_balance', $price);

            $type = CoinTransactionType::firstOrCreate(
                ['name' => 'Buy card theme', 'type' => 'D']
            );
            CoinTransaction::create([
                'transaction_datetime' => now(),
                'user_id' => $user->id,
                'coin_transaction_type_id' => $type->id,
                'coins' => -$price,
            ]);

            $custom['owned_card_themes'][] = $cardName;

            $user->custom = $custom;
            $user->card_theme = $cardName;
            $user->save();
        });

        return response()->json([
            'message' => 'Card Theme purchased successfully!',
            'user' => $user
        ]);
    }

    public function changeTheme(Request $request)
    {
        $request->validate([
            'theme' => 'required|string',
        ]);

        $user = $request->user();
        $cardName = $request->theme;

        DB::transaction(function () use ($user, $cardName) {
            $custom = is_array($user->custom) ? $user->custom : [];

            if (!isset($custom['owned_card_themes'])) {
                $custom['owned_card_themes'] = [];
            }

            if (!in_array($cardName, $custom['owned_card_themes'])) {
                abort(409, 'Theme not owned');
            }

            $user->card_theme = $cardName;
            $user->save();
        });

        return response()->json([
            'message' => 'Card Theme changed successfully!',
            'user' => $user
        ]);
    }

    public function updateUserCoins(Request $request)
    {
        $data = $request->validate([
            'stake' => 'required|integer|min:0',
        ]);

        $user = $request->user();

        if ($user->coins_balance < $data['stake']) {
            return response()->json(['message' => 'Saldo insuficiente'], 400);
        }

        DB::transaction(function () use ($user, $data) {
            $stake = $data['stake'];

            // Create / get type for multiplayer game stake (debit)
            $type = CoinTransactionType::firstOrCreate(
                ['name' => 'Multiplayer game stake', 'type' => 'D']
            );

            CoinTransaction::create([
                'transaction_datetime'      => now(),
                'user_id'                   => $user->id,
                'coin_transaction_type_id'  => $type->id,
                'coins'                     => -$stake,
                'custom'                    => ['context' => 'multiplayer_entry'],
            ]);

            $user->decrement('coins_balance', $stake);
        });

        $user->refresh();

        return response()->json([
            'message' => 'Stake reduced!',
            'coins_balance' => $user->coins_balance,
        ]);
    }

    public function updateRewardCoins(Request $request)
    {
        $request->validate([
            'reward' => 'required|integer|min:0',
        ]);

        $user = $request->user();

        $user->coins_balance += $request->reward;
        $user->save();

        return response()->json([
            'message' => 'Coins Added!',
            'coins_balance' => $user->coins_balance,
        ]);
    }

    public function patchPhotoURL(Request $request, User $user)
    {
        $data = $request->validate(['photo_avatar_filename' => 'required|string']);
        if ($user->photo_avatar_filename) {
            if (Storage::disk('public')->exists('photos_avatars/' . $user->photo_avatar_filename)) {
                Storage::disk('public')->delete('photos_avatars/' . $user->photo_avatar_filename);
            }
        }
        $user->photo_avatar_filename = $data['photo_avatar_filename'];
        $user->save();
        return new UserResource($user);
    }

    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!\Hash::check($request->password, $user->password)) {
            return response()->json(['verified' => false], 400);
        }

        return response()->json(['verified' => true], 200);
    }

    public function updateBlocked(Request $request, User $user)
    {
        if ($request->user()->type !== 'A') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'blocked' => ['required', 'boolean'],
        ]);

        $user->blocked = $data['blocked'];
        $user->save();

        return new UserResource($user);
    }

    public function updateType(Request $request, User $user)
    {
        if ($request->user()->type !== 'A') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'type' => ['required', 'string', 'in:A,P'],
        ]);

        $user->type = $data['type'];
        $user->save();

        return new UserResource($user);
    }
}
