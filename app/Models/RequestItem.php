<?php

namespace App\Models;

use App\Traits\Loggable;
use Illuminate\Database\Eloquent\Model;

class RequestItem extends Model
{
    use Loggable;
    protected $table = 'request_items';
    protected $fillable = [
        'request_id',
        'category',
        'type_of_request',
        'request_mode',
        'issued_to',
        'location',
        'quantity',
        'purpose_of_request',
        'item_status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'quantity' => 'integer',
    ];

    // Relationships
    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    public function issuedToEmployee()
    {
        return $this->belongsTo(Masterlist::class, 'issued_to', 'employid');
    }



    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeBulkMode($query)
    {
        return $query->where('request_mode', 'bulk');
    }

    public function scopePerItemMode($query)
    {
        return $query->where('request_mode', 'per-item');
    }

    // Helper methods
    public function isBulk()
    {
        return $this->request_mode === 'bulk';
    }

    public function isPerItem()
    {
        return $this->request_mode === 'per-item';
    }
}
