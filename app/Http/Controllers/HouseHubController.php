<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHouseHubRequest;
use App\Http\Requests\UpdateHouseHubRequest;
use App\Models\Role;
use App\Models\HouseHub;
use Illuminate\Http\Response;

class HouseHubController extends Controller
{
    private $first;

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
        //

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreHouseHubRequest $request)
    {
        $validatedData = $request->validated();
        $userId = auth()->id();

        $houseHub = HouseHub::create($validatedData);

        $role = Role::create([
            'name' => $validatedData['role'],
            'house_hub_id' => $houseHub->id,
            'user_id' => $userId,
        ]);
        return response()->json([
            'message' => 'HouseHub Created Successfully',
            'data' => [
                'houseHub' => $houseHub,
                'role' => $role
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $houseHub = HouseHub::findOrFail($id);
        return response()->json([
            'data' => $houseHub
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HouseHub $houseHub)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateHouseHubRequest $request, HouseHub $houseHub)
    {
        $userId = auth()->id();
        $role = Role::where('house_hub_id', $houseHub->id)
            ->where('user_id', $userId)
            ->whereIn('name', ['owner', 'committee_member'])
            ->first();

        if (!$role) {
            return response()->json([
                'message' => 'You are not authorized to update this HouseHub.'
            ], Response::HTTP_FORBIDDEN);
        }
        $houseHub->update($request->validated());
        return response()->json([
            'message' => 'HouseHub updated successfully.',
            'house_hub' => $houseHub
        ], Response::HTTP_OK);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HouseHub $houseHub)
    {
        $userId = auth()->id();
        $role = Role::where('house_hub_id', $houseHub->id)
            ->where('user_id', $userId)
            ->whereIn('name', ['owner', 'committee_member'])
            ->first();

        if (!$role) {
            return response()->json([
                'message' => 'You are not authorized to delete this HouseHub.'
            ], Response::HTTP_FORBIDDEN);
        }
        $houseHub->delete();
        return response()->json([
            'message' => 'HouseHub deleted successfully.'
        ], Response::HTTP_OK);
    }
}
