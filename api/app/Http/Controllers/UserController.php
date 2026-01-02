<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        if ($user->coins_balance < $request->price) {
            return response()->json(['message' => 'Saldo insuficiente'], 400);
        }

        $user->coins_balance -= $request->price;
        $user->card_theme = $request->theme; 
        $user->save();

        return response()->json([
            'message' => 'Carta comprada com sucesso!',
            'user' => $user
        ]);
    }

    public function updateAvatar(Request $request)
    {
            $request->validate([
            'img' => 'required|string',
            'price' => 'required|integer|min:0',
        ]);

        $user = $request->user();

        if ($user->coins_balance < $request->price) {
            return response()->json(['message' => 'Saldo insuficiente'], 400);
        }

        $user->coins_balance -= $request->price;
        $user->photo_avatar_filename = $request->img; 
        $user->save();

        return response()->json([
            'message' => 'Carta comprada com sucesso!',
            'user' => $user
        ]);
    }

    
    public function updateUserCoins(Request $request)
    {
        $request->validate([
            'stake' => 'required|integer|min:0',
        ]);

        $user = $request->user();

        if ($user->coins_balance < $request->stake) {
            return response()->json(['message' => 'Saldo insuficiente'], 400);
        }

        $user->coins_balance -= $request->stake;
        $user->save();

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
            if (Storage::disk('public')->exists('photos/' . $user->photo_avatar_filename)) {
                Storage::disk('public')->delete('photos/' . $user->photo_avatar_filename);
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
        $data = $request->validate([
            'blocked' => ['required', 'boolean'],
        ]);

        $user->blocked = $data['blocked'];
        $user->save();

        return new UserResource($user);
    }

    public function updateType(Request $request, User $user)
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:A,P'],
        ]);

        $user->type = $data['type'];
        $user->save();

        return new UserResource($user);
    }
}
