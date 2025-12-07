<?php

namespace App\Http\Controllers;

use App\Models\SingleMatches;
use Illuminate\Http\Request;
use App\Http\Requests\StoreMatchesRequest; 
use App\Http\Requests\UpdateSingleMatchesRequest;

class SingleMatchesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         return SingleMatches::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMatchesRequest $request)
    {
        $matches_single = SingleMatches::create($request->validated());
        return response()->json($matches_single, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SingleMatches $matches_single)
    {
        return $matches_single;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSingleMatchesRequest $request, SingleMatches $single_match)
    {
        $single_match->update($request->validated());
        return response()->json($single_match);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SingleMatches $singleMatches)
    {
        //
    }
}
