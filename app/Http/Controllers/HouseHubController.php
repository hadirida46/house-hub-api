<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHouseHubRequest;
use App\Http\Requests\UpdateHouseHubRequest;
use App\Models\HouseHub;
use Illuminate\Http\Response;
use function Pest\Laravel\json;


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
        $validatedData['user_id'] = auth()->id();

        $houseHub = HouseHub::create($validatedData);

        return response()->json([
            'message' => 'HouseHub Created Successfully',
            'data' => $houseHub
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HouseHub $houseHub)
    {    
        $user = auth()->user();
        $buildingIds = $houseHub->buildings->pluck('id');
        $this->first = $user->buildingResidents()
            ->whereIn('building_id', $buildingIds)
            ->first();
        $resident = $this->first;
        if (!$resident || !$resident->is_admin) {
            return response()->json([
                'message' => 'You Are Not Authorized To Delete This HouseHub'
            ], Response::HTTP_FORBIDDEN);
        }
        $houseHub->delete();
        return response()->json([
            'message' => 'HouseHub Deleted Successfully'
        ]);
    }
}
