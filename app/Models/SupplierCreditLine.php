<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierCreditLine extends Model
{
    protected $table = 'supplier_credit_lines';

    protected $fillable = [
        'supplier_credit_id',
        'account_id',
        'description',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the supplier credit associated with this line.
     */
    public function supplierCredit(): BelongsTo
    {
        return $this->belongsTo(SupplierCredit::class);
    }

    /**
     * Get the chart of accounts entry associated with this line.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(ChartOfAcc::class);
    }
}
