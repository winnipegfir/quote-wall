<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Quote extends Model
{
    use HasFactory, Searchable;

    const PENDING_REVIEW =  1;
    const APPROVED =        2;
    const REFUSED =         3;

    protected $primaryKey = 'uuid';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $guarded = [''];

    protected $hidden = ['ip_address', 'status', 'updated_at'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Model $model) {
            $model->setAttribute($model->getKeyName(), Str::uuid());
        });
    }

    public function getAuditLogsAttribute()
    {
        return $this->hasMany(AuditLog::class)->orderByDesc('created_at')->get();
    }

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();

        $array['status'] = $this->status;

        return $array;
    }
}
