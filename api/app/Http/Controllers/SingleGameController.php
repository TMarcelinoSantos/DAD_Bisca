<?php

namespace App\Http\Controllers;

use App\Models\SingleGame;
use App\Http\Resources\SingleGameResource;
use Illuminate\Http\Request;
use App\Http\Requests\StoreSingleGameRequest;
use App\Http\Requests\UpdateSingleGameRequest;

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
        return new SingleGameResource($game_single);
    }

    /**
     * Display the specified resource.
     */
    public function show(SingleGame $game_single)
    {
        return new SingleGameResource($game_single);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSingleGameRequest $request, SingleGame $games_single)
    {
        \Log::info('SingleGame update payload', $request->validated());
        $games_single->update($request->validated());
        return new SingleGameResource($games_single);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SingleGame $game_single)
    {
        //
    }
}