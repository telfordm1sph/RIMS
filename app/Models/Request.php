<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use Loggable;
    protected $table = 'requests';
    protected $fillable = [
        'request_number',
        'requestor_id',
        'requestor_name',
        'requestor_department',
        'requestor_prodline',
        'requestor_station',
        'status',
        'remarks',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function items()
    {
        return $this->hasMany(RequestItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(Masterlist::class, 'created_by', 'employid');
    }

    public function updater()
    {
        return $this->belongsTo(Masterlist::class, 'updated_by', 'employid');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeByRequestor($query, $employid)
    {
        return $query->where('employid', $employid);
    }

    // Helper methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function getTotalItemsAttribute()
    {
        return $this->items()->count();
    }

    public function getTotalQuantityAttribute()
    {
        return $this->items()->sum('quantity');
    }
}
