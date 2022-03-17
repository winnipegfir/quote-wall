<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IpBan extends Model
{
    use HasFactory;

    protected $guarded = [''];

    public function getQuotesAttribute()
    {
        return $this->hasMany(Quote::class, 'ip_address', 'ip_address')->get();
    }
}
