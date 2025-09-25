<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\BuildingResident;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\InviteUserMail;
use App\Http\Requests\StoreResidentRequest;
use App\Http\Requests\DestroyResidentRequest;
use App\Models\Apartment;

class BuildingResidentController extends Controller
{
    public function store(StoreResidentRequest $request)
    {
        $data = $request->validated();
        $apartment = Apartment::findOrFail($data['apartment_id']);
        $building = $apartment->building;
        $houseHubName = $building->houseHub?->name;
        $apartmentName = $apartment->name;
        $apartmentFloor = $apartment->floor;

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            $password = Str::random(10);
            $user = User::create([
                'name' => explode('@', $data['email'])[0],
                'email' => $data['email'],
                'password' => Hash::make($password),
            ]);

            Mail::to($user->email)->send(new InviteUserMail($user, $password, $houseHubName, $building->name, $apartmentFloor, $apartmentName, 'You Are Invited To Be Resident In Apartment'));
            $user->sendEmailVerificationNotification();
        }
        $alreadyResident = $apartment->BuildingResident()
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyResident) {
            return response()->json([
                'message' => 'This user is already a resident of this apartment.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        $data['user_id'] = $user->id;
        $data['building_id'] = $building->id;

        $buildingResident = BuildingResident::create($data);
        return response()->json([
            'message' => 'BuildingResident created successfully',
            'building_resident' => $buildingResident
        ], Response::HTTP_CREATED);
    }

    public function show(BuildingResident $resident)
    {
        $residentUser = $resident->user;
        return response()->json(['Resident' => $residentUser]);
    }

    public function destroy(DestroyResidentRequest $request, BuildingResident $resident)
    {
        $resident->delete();
        return response()->json([
            'message' => 'Building Resident removed successfully'
        ]);
    }
}
