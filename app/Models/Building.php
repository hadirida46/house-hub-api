<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Building extends Model
{
    /** @use HasFactory<\Database\Factories\BuildingFactory> */
    use HasFactory;
    protected $fillable = [
        'house_hub_id',
        'name',
        'floors_count',
        'apartments_count',
    ];

    public function houseHub(){
        return $this->belongsTo(HouseHub::class);
    }
}
