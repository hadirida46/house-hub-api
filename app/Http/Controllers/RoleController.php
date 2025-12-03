<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\DestroyRoleRequest;
use App\Models\User;
use App\Models\Role;
use App\Models\HouseHub;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Mail\HouseHubRoleInvite;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Response;

class RoleController extends Controller
{
    public function store(StoreRoleRequest $request)
    {
        $email = $request->input('email');
        $user = User::where('email', $email)->first();
        $role = $request->input('name');
        $househub_id = $request->input('househub_id');
        $houseHub = HouseHub::find($househub_id);
        $houseHubName = $houseHub->name;
        $inviteLink = url("api/accept-invite?email={$email}&role={$role}&househub_id={$househub_id}");

        if ($user) {
            $userId = $user->id;

            $alreadyHasRole = Role::where('user_id', $userId)
                ->where('house_hub_id', $househub_id)
                ->exists();

            if ($alreadyHasRole) {
                return response()->json([
                    'message' => "This user already has a role in {$houseHubName}."
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $password = null;

        } else {
            $password = Str::random(10);

            $user = User::create([
                'name' => explode('@', $email)[0],
                'email' => $email,
                'password' => Hash::make($password),
            ]);

            $user->sendEmailVerificationNotification();
        }

        Mail::to($email)->send(
            new HouseHubRoleInvite(
                $email,
                $role,
                $houseHubName,
                $inviteLink,
                $user->name,
                $password
            )
        );
        return response()->json([
            'message' => "Invitation sent!",
        ], Response::HTTP_OK);
    }


    public function acceptRole(Request $request)
    {
        $email = $request->query('email');
        $role = $request->query('role');
        $user = User::where('email', $email)->first();
        $househub_id = $request->query('househub_id');

        Role::create([
            'user_id' => $user->id,
            'house_hub_id' => $househub_id,
            'name' => $role,
        ]);

        return "You have successfully joined the HouseHub as {$role}.";
    }

    public function showRoles(Request $request)
    {
        $househubId = $request->route('househub_id');
        $househub = HouseHub::with('roles.user')->findOrFail($househubId);
        $usersWithRoles = $househub->roles->map(function ($role) {
            return [
                'role' => $role->name,
                'role_id' => $role->id,
                'user' => $role->user,
            ];
        });
        return response()->json([
            'users_with_roles' => $usersWithRoles,
        ], Response::HTTP_OK);
    }

    public function destroyRole(DestroyRoleRequest $request)
    {
        $roleId = $request->route('role');
        $role = Role::findOrFail($roleId);
        $househub = HouseHub::findOrFail($role->house_hub_id);

        $roles = $househub->roles()
            ->whereIn('name', ['owner', 'committee_member'])
            ->get();
        if ($roles->count() <= 1) {
            return response()->json([
                'message' => "At least one Committee Member or Owner must remain in the House Hub."
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $role->delete();
        return response()->json([
            'message' => "Role has been deleted."
        ], Response::HTTP_OK);
    }
}
