<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class BuildingResident extends model
{
    /** @use HasFactory<\Database\Factories\BuildingResidentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'apartment_id',
    ];
    public function user() {
        return $this->belongsTo(User::class);
    }
    public function apartment() {
        return $this->belongsTo(apartment::class, 'apartment_id');
    }
}
