<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Role;

class StoreBuildingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $userId = $this->user()->id;

        return Role::where('house_hub_id', $this->input('house_hub_id'))
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
            'house_hub_id' => 'required|integer|exists:house_hubs,id',
            'name' => 'required|string|max:255',
            'floors_count' => 'required|integer|min:1',
            'apartments_count' => 'required|integer|min:1',
        ];
    }
}
