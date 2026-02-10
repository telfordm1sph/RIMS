<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Loggable;

class Hardware extends Model
{
    use Loggable;

    protected $table = 'hardware';
    protected $connection = 'inventory';
    protected $fillable = [
        'hostname',
        'issued_to',
        'category',
        'location',
        'model',
        'brand',
        'processor',
        'motherboard',
        'serial_number',
        'ip_address',
        'wifi_mac',
        'lan_mac',
        'remarks',
        'status',
        'issued_to',
        'installed_by',
        'date_issued',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_issued' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable')->latest('action_at');
    }


    // Relationships
    public function issuedToUser()
    {
        return $this->belongsTo(User::class, 'issued_to')
            ->select('EMPLOYID', 'EMPNAME');
    }

    public function installedByUser()
    {
        return $this->belongsTo(User::class, 'installed_by')
            ->select('EMPLOYID', 'EMPNAME');
    }

    public function software()
    {
        return $this->belongsToMany(
            Software::class,
            'hardware_software',
            'hardware_id',
            'software_id'
        )->withTimestamps();
    }

    public function parts()
    {
        return $this->hasMany(HardwareParts::class, 'hardware_id', 'hostname');
    }
}
