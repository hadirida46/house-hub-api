<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreapartmentRequest;
use App\Http\Requests\UpdateapartmentRequest;
use App\Models\apartment;
use App\Models\Building;
use App\Models\User;
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

        if (!$building) {
            return response()->json([
                'message' => 'Building not found'
            ], Response::HTTP_NOT_FOUND);
        }
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
