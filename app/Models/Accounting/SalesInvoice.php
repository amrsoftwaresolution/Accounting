<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Customer;
use App\Models\Vehicle;

class SalesInvoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'receipt_no', 'customer_id', 'email', 'receipt_date', 'payment_method_id',
        'deposit_to_account_id', 'total_amount', 'memo', 'statement_message', 'status',
        'vehicle_id',
    ];

    public function items()
    {
        return $this->hasMany(SalesInvoiceItem::class);
    }

    public function depositToAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'deposit_to_account_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function journalEntry()
    {
        return $this->morphOne(JournalEntry::class, 'transactionable');
    }
}
