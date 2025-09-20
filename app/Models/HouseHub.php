<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseHub extends Model
{
    /** @use HasFactory<\Database\Factories\HouseHubFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'location',
        'latitude',
        'longitude',
    ];

    public function buildings()
    {
        return $this->hasMany(Building::class);
    }
    public function roles(){
        return $this->hasMany(Role::class);
    }
}
