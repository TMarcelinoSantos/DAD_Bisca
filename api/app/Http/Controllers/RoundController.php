<?php

namespace App\Http\Controllers;

use App\Models\Round;
use Illuminate\Http\Request;
use App\Http\Resources\RoundResource;
use App\Http\Requests\StoreRoundRequest;

class RoundController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RoundResource::collection(Round::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoundRequest $request)
    {
        $round = Round::create($request->validated());
        $round->saveOrFail();
        return new RoundResource($round);
    }

    /**
     * Display the specified resource.
     */
    public function show(Round $round)
    {
        return new RoundResource($round);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreRoundRequest $request, Round $round)
    {
        $round->update($request->validated());
        return new RoundResource($round);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Round $round)
    {
        //
    }
}