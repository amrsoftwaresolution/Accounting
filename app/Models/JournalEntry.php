<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    protected $fillable = [
        'date',
        'reference_type',
        'reference_id',
        'reference_no',
        'description',
        'total_debit',
        'total_credit',
        'created_by'
    ];

    public function lines()
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
