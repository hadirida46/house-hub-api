<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUserRequest;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Verified;

class UserController extends Controller
{
    public function register(RegisterUserRequest $request)
    {
        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);
        event(new Registered($user));
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'User registered. Please verify your email.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);

    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid Credentials'], Response::HTTP_UNAUTHORIZED);
        }
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        // This Function Deletes All The Tokens That Belongs To A User
        $user = $request->user();
        if ($user) {
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'Logged Out Successfully'], 200);
        }
        return response()->json(['message' => 'No authenticated user'], 401);

    }

    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->delete();
        return response()->json(['message' => 'Deleted Successfully'], 200);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
            'profile_picture' => $user->profile_picture ? asset('storage/profile_pictures/' . $user->profile_picture) : null,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }


    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => ['sometimes', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'delete_picture' => 'nullable|boolean',
        ]);
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profile_pictures', $filename, 'public');
            $validated['profile_picture'] = $filename;
        }

        if ($request->has('delete_picture') && filter_var($request->delete_picture, FILTER_VALIDATE_BOOLEAN)) {
            if ($user->profile_picture) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete('profile_pictures/' . $user->profile_picture);
            }
            $validated['profile_picture'] = null;
        }
        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $user->email_verified_at = null;
            $validated['email_verified_at'] = null;
            $user->update($validated);
            $user->sendEmailVerificationNotification();
        } else {
            $user->update($validated);
        }
        $user->refresh();
        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'profile_picture' => $user->profile_picture
                    ? asset('storage/profile_pictures/' . $user->profile_picture)
                    : null,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'current_password' => ['The current password field is incorrect.'],
                ]
            ], 422);
        }
        $user->password = Hash::make($validated['password']);
        $user->save();
        return response()->json(['message' => 'Password updated successfully.'], 200);
    }

    public function sendVerificationEmail(Request $request)
    {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], Response::HTTP_BAD_REQUEST);
        }$user->sendEmailVerificationNotification();
        return response()->json(['message' => 'Email verification link sent on your inbox.'], Response::HTTP_OK);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = user::findOrFail($id);
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Invalid verification link.'], 400);
        }
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }
        $user->markEmailAsVerified();
        event(new Verified($user));
        return response()->json(['message' => 'Email verified successfully.'], 200);
    }
    public function getUserHouseHubs(Request $request)
    {
        $user = $request->user();

        $houseHubsByRoles = \App\Models\HouseHub::whereIn('id', function ($q) use ($user) {
            $q->select('house_hub_id')
                ->from('roles')
                ->where('user_id', $user->id);
        })->get();

        $houseHubsByResidency = \App\Models\HouseHub::whereIn('id', function ($q) use ($user) {
            $q->select('house_hubs.id')
                ->from('house_hubs')
                ->join('buildings', 'buildings.house_hub_id', '=', 'house_hubs.id')
                ->join('apartments', 'apartments.building_id', '=', 'buildings.id')
                ->join('building_residents', 'building_residents.apartment_id', '=', 'apartments.id')
                ->where('building_residents.user_id', $user->id);
        })->get();

        $merged = $houseHubsByRoles->merge($houseHubsByResidency)->unique('id')->values();

        return response()->json([
            'househubs' => $merged
        ]);
    }


}
