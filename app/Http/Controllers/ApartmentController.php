<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreapartmentRequest;
use App\Http\Requests\UpdateapartmentRequest;
use App\Models\apartment;
use App\Models\Building;
use App\Models\User;
use Illuminate\Http\Response;

class ApartmentController extends Controller
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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreapartmentRequest $request)
    {
        $buildingId = $request->input('building_id');
        $building = Building::find($buildingId);
        $floor = $request->input('floor');
        $userId = User::where('email', $request->email)->first()->id;

        if (!$userId) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if ($floor > $building->floors_count) {
            return response()->json([
                'message' => 'Floor limit exceeded'
            ], Response::HTTP_NOT_FOUND);
        }
        $data = $request->validated();
        $data['user_id'] = $userId;

        $apartment = Apartment::create($data);
        return response()->json([
            'massage' => 'apartment created successfully',
            'Apartment' => $apartment
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(apartment $apartment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(apartment $apartment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateapartmentRequest $request, apartment $apartment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(apartment $apartment)
    {
        //
    }
}
