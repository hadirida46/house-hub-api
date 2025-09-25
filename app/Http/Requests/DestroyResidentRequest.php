<?php

namespace App\Http\Requests;

use App\Models\Apartment;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;

class DestroyResidentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $userId = $this->user()->id;
        $apartmentId = $this->route('resident')->apartment_id;
        $apartment = Apartment::find($apartmentId);
        if (!$apartment) {
            return false;
        }
        if ($apartment->user_id === $userId) {
            return true;
        }
        $building = $apartment->building;
        if (!$building || !$building->house_hub_id) {
            return false;
        }
        $houseHubId = $building->house_hub_id;

        return Role::where('house_hub_id', $houseHubId)
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
