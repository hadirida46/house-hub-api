<?php

namespace App\Http\Requests;

use App\Models\HouseHub;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;

class DestroyRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $userId = $this->user()->id;
        $roleId = $this->route('role');
        $househubId = Role::where('id', $roleId)->first()->house_hub_id;
        $househub = Househub::find($househubId);
        if(!$househub){
            return false;
        }
        return Role::where('house_hub_id', $househubId)
            ->where('user_id', $userId)
            ->whereIn('name', ['owner', 'committee_member'])
            ->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
        ];
    }
}
