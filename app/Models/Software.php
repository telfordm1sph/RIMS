<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Loggable;

class Software extends Model
{
    use Loggable;
    protected $table = 'software';
    protected $connection = 'inventory';
    protected $fillable = [
        'id',
        'name',
        'type',
        'license_key',
        'expiration_date',
        'account_user',
        'password',
        'qty',
        'created_by',
        'updated_by',

    ];

    protected $casts = [

        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    public function hardware()
    {
        return $this->belongsToMany(
            Hardware::class,
            'hardware_software',
            'software_id',
            'hardware_id'
        )->withPivot('installed_date', 'remarks')
            ->withTimestamps();
    }
}
