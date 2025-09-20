<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBuildingRequest;
use App\Http\Requests\UpdateBuildingRequest;
use App\Models\Building;
use Illuminate\Http\Response;
use App\Models\Role;

class BuildingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBuildingRequest $request)
    {
        $building = Building::create($request->validated());

        return response()->json([
            'message' => 'Building Created Successfully',
            'data' => $building->toArray()
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Building $building)
    {
        return response()->json(['building' => $building]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Building $building)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBuildingRequest $request, Building $building)
    {
        $building->update($request->validated());
        return response()->json([
            'message' => 'Building Updated Successfully',
            'building' => $building->toArray()
        ], Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Building $building)
    {
        $userId = auth()->id();
        $houseHub = $building->house_hub_id;;

        $authorized = Role::where('house_hub_id', $houseHub)
            ->where('user_id', $userId)
            ->whereIn('name', ['owner', 'committee_member'])
            ->exists();
        if (!$authorized) {
            return response()->json(['message' => 'Unauthorized User',], Response::HTTP_UNAUTHORIZED);
        }
        $building->delete();
        return response()->json(['message' => 'Building Deleted Successfully'], Response::HTTP_OK);
    }
}
