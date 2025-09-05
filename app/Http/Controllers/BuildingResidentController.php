<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\BuildingResident;
use League\Uri\Http;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class BuildingResidentController extends Controller
{
    public function storeResidents(Request $request, $id)
    {
        $building = Building::find($id);
        if (!$building) {
            return response()->json(['message' => 'Building Not Found'],  Response::HTTP_NOT_FOUND);
        }
        $resident = $building->buildingResidents()->create([
            'user_id' => $request->user_id,
            'is_admin' => $request->is_admin,
            'floor' => $request->floor,
            'apartment' => $request->apartment,
        ]);
        return response()->json([
            'message' => 'Resident added successfully',
            'data' => $resident
        ], Response::HTTP_CREATED);
    }
}
