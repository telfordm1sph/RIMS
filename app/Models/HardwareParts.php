<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Loggable;

class HardwareParts extends Model
{
    use Loggable;

    protected $table = 'hardware_parts';
    protected $connection = 'inventory';
    protected $fillable = [
        'hardware_id',
        'part_type',
        'brand',
        'model',
        'serial',
        'details',
        'remarks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    public function hardware()
    {
        return $this->belongsTo(Hardware::class, 'hardware_id')
            ->select('id', 'hostname');
    }
}
