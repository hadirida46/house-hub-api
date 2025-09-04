<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseHub extends Model
{
    /** @use HasFactory<\Database\Factories\HouseHubFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'location',
        'latitude',
        'longitude',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function buildings()
    {
        return $this->hasMany(Building::class);
    }
}
