<?php

namespace App\Http\Controllers;

use App\Models\SingleGame;
use Illuminate\Http\Request;
use App\Http\Requests\StoreSingleGameRequest;

class SingleGameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return SingleGame::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSingleGameRequest $request)
    {
        $game_single = SingleGame::create($request->validated());
        return response()->json($game_single, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SingleGame $game_single)
    {
        return $game_single;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreSingleGameRequest $request, SingleGame $game_single)
    {
        $game_single->update($request->validated());
        return response()->json($game_single);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SingleGame $game_single)
    {
        //
    }
}