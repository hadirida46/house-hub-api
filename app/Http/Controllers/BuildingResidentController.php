<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBuildingResidentRequest;
use App\Http\Requests\UpdateBuildingResidentRequest;
use App\Models\Building;
use App\Models\BuildingResident;
use Illuminate\Http\Request;

class BuildingResidentController extends Controller
{
    public function storeResidents(Building $building, Request $request)
    {
        $building->buildingResidents()->create([
            'user_id' => $request->user_id,
            'is_admin' => false,
            'is_active' => true,
        ]);
    }
}
