<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'house_hub_id',
        'user_id',
    ];

    public function user(){
        return $this->belongsTo('App\Models\User');
    }
    public function house_hub(){
        return $this->belongsTo('App\Models\HouseHub');
    }
}
