<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuildingResident extends Model
{
    /** @use HasFactory<\Database\Factories\BuildingResidentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'building_id',
        'is_admin',
        'floor',
        'apartment',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function building() {
        return $this->belongsTo(Building::class, 'building_id');
    }
}
