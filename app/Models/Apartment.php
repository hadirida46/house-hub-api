<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Apartment extends Model
{
    /** @use HasFactory<\Database\Factories\ApartmentFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'building_id',
        'floor',
        'name',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
    public function building(){
        return $this->belongsTo(Building::class);
    }
    public function BuildingResident(){
        return $this->hasMany(BuildingResident::class);
    }
}
