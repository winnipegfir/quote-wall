<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $guarded = [''];

    protected $appends = ['user'];

    public function getUserAttribute()
    {
        return $this->belongsTo(User::class, 'user_cid', 'cid')->first();
    }
}
