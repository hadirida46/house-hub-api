<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterUserRequest;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    public function register(RegisterUserRequest $request)
    {
        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
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
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => ['sometimes', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profile_pictures', $filename, 'public');
            $validated['profile_picture'] = $filename;
        }
        $user->update($validated);
        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Invalid Credentials'], 403);
        }
        $user->password = Hash::make($validated['new_password']);
        $user->save();
        return response()->json(['message' => 'Password updated successfully.'], 200);
    }

}
