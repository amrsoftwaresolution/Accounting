<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditNoteLine extends Model
{
    protected $table = 'credit_note_lines';

    protected $fillable = [
        'credit_note_id',
        'service_date',
        'account_id',
        'description',
        'amount',
    ];

    protected $casts = [
        'service_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the credit note associated with this line.
     */
    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class);
    }

    /**
     * Get the chart of accounts entry associated with this line.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAcc::class);
    }
}
