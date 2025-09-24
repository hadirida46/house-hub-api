<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Role;
use App\Models\Building;

class UpdateapartmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $userId = $this->user()->id;
        $buildingId = $this->input('building_id');
        $building = Building::find($buildingId);

        if (!$building || !$building->house_hub_id) {
            return false;
        }
        $househubId = $building->house_hub_id;

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
            'email' => 'sometimes|email|unique:users,email,' . $this->apartment->user_id,
            'building_id' => 'sometimes|integer|exists:buildings,id',
            'name' => 'sometimes|string|max:255',
            'floor' => 'sometimes|integer|min:1',
        ];
    }
}
