<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreapartmentRequest;
use App\Http\Requests\UpdateapartmentRequest;
use App\Models\apartment;
use App\Models\Building;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Response;
use App\Mail\InviteUserMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;


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
        $data = $request->validated();
        $building = Building::find($data['building_id']);
        $houseHubName = $building->houseHub?->name;

        if ($data['floor'] > $building->floors_count) {
            return response()->json([
                'message' => 'Floor limit exceeded'
            ], Response::HTTP_BAD_REQUEST);
        }
        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            $password = Str::random(10);
            $user = User::create([
                'name' => explode('@', $data['email'])[0],
                'email' => $data['email'],
                'password' => Hash::make($password),
            ]);
            Mail::to($user->email)->send(new InviteUserMail($user, $password, $houseHubName, $building['name'], $data['floor'], $data['name'], 'You Are Invited To Be Owner Of Apartment'));
            $user->sendEmailVerificationNotification();
        }
        $data['user_id'] = $user->id;

        $apartment = Apartment::create($data);
        return response()->json([
            'message' => 'Apartment created successfully',
            'apartment' => $apartment
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(apartment $apartment)
    {
        return response()->json(['apartment' => $apartment]);
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
    public function update(UpdateapartmentRequest $request, Apartment $apartment)
    {
        $data = $request->validated();
        $building = isset($data['building_id'])
            ? Building::find($data['building_id'])
            : $apartment->building;
        $houseHubName = $building?->houseHub?->name;
        if (isset($data['floor']) && $data['floor'] > $building->floors_count) {
            return response()->json([
                'message' => 'Floor limit exceeded'
            ], Response::HTTP_BAD_REQUEST);
        }
        if (isset($data['email'])) {
            $user = User::where('email', $data['email'])->first();
            if (!$user) {
                $password = Str::random(10);
                $user = User::create([
                    'name' => explode('@', $data['email'])[0],
                    'email' => $data['email'],
                    'password' => Hash::make($password),
                ]);
                Mail::to($user->email)->send(
                    new InviteUserMail($user, $password, $houseHubName, $building['name'], $data['floor'] ?? $apartment->floor, $data['name'] ?? $apartment->name, 'You Are Invited To Be Owner Of Apartment'));
                $user->sendEmailVerificationNotification();
            }
            $data['user_id'] = $user->id;
        }
        $apartment->update($data);
        return response()->json([
            'message' => 'Apartment updated successfully',
            'apartment' => $apartment->fresh(),
        ], Response::HTTP_OK);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(apartment $apartment)
    {
        $userId = auth()->id();
        $building = $apartment->building;
        $houseHub = $building?->houseHub;

        $authorized = Role::where('house_hub_id', $houseHub->id)
            ->where('user_id', $userId)
            ->whereIn('name', ['owner', 'committee_member'])
            ->exists();
        if (!$authorized) {
            return response()->json(['message' => 'Unauthorized User',], Response::HTTP_UNAUTHORIZED);
        }

        $apartment->delete();
        return response()->json([
            'message' => 'Apartment deleted successfully',
        ], Response::HTTP_OK);
    }
}
