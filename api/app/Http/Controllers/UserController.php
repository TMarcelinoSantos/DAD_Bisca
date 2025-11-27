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
        //
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
}
