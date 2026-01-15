<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestType extends Model
{
    use HasFactory;

    protected $table = 'request_types';

    public $timestamps = false;

    protected $fillable = [
        'request_category',
        'request_name',
        'request_description',
        'is_active',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
    ];
}
