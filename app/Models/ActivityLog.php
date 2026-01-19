<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $connection = 'inventory';
    protected $fillable = [
        'loggable_type',
        'loggable_id',
        'action_type',
        'action_by',
        'action_at',
        'old_values',
        'new_values',
        'remarks',
        'metadata',
        'related_type',
        'related_id',
    ];

    protected $casts = [
        'action_at' => 'datetime',
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Polymorphic relationship to any model
     */
    public function loggable()
    {
        return $this->morphTo();
    }

    /**
     * Related entity (optional)
     */
    public function related()
    {
        return $this->morphTo('related');
    }

    /**
     * User who performed the action
     */
    public function actionByUser()
    {
        return $this->belongsTo(User::class, 'action_by', 'EMPLOYID');
    }
}
