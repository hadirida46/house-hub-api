<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Role;
use App\Models\Building;

class StoreapartmentRequest extends FormRequest
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
            'email' => 'required|email',
            'building_id' => 'required|integer|exists:buildings,id',
            'name' => 'required|string|max:255',
            'floor' => 'required|integer|min:1',
        ];
    }
}
