<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CreditNote extends Model
{
    protected $table = 'credit_notes';

    protected $fillable = [
        'customer_id',
        'email',
        'billing_address',
        'date',
        'credit_note_no',
        'message_on_note',
        'message_on_statement',
        'discount_percent',
        'subtotal',
        'total_amount',
    ];

    protected $casts = [
        'date' => 'date',
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_percent' => 'decimal:2',
    ];

    /**
     * Get the customer associated with this credit note.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the line items for this credit note.
     */
    public function lines(): HasMany
    {
        return $this->hasMany(CreditNoteLine::class);
    }
}
