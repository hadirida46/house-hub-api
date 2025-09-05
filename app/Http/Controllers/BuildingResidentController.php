<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\BuildingResident;
use Illuminate\Support\Facades\Hash;
use League\Uri\Http;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class BuildingResidentController extends Controller
{
    public function storeResidents(Request $request, $id)
    {
        $building = Building::find($id);
        if (!$building) {
            return response()->json(['message' => 'Building Not Found'],  Response::HTTP_NOT_FOUND);
        }
        $request->validate([
            'email' => 'required|email',
            'is_admin' => 'required|boolean',
            'floor' => 'required|integer',
            'apartment' => 'required|String',
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            $password = Str::random(10);
            $user = User::create([
                'name' => explode('@', $request->email)[0],
                'email' => $request->email,
                'password' => bcrypt($password),
            ]);
            mail::to($user->email)->send(new InvitationUserMail($user, $password));
        }
        $resident = $building->buildingResidents()->create([
            'user_id' => $user->id,
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
