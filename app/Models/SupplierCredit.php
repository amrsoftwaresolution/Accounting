<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierCredit extends Model
{
    protected $table = 'supplier_credits';

    protected $fillable = [
        'supplier_id',
        'date',
        'ref',
        'memo',
        'total_amount',
    ];

    protected $casts = [
        'date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the supplier associated with this credit.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the line items for this credit.
     */
    public function lines(): HasMany
    {
        return $this->hasMany(SupplierCreditLine::class);
    }
}
