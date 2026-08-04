<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Customer;
use OwenIt\Auditing\Contracts\Auditable;

class ChequeLine extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $fillable = [
        'cheque_id',
        'category_account_id',
        'description',
        'amount',
        'customer_id',
        'line_order',
    ];

    public function cheque()
    {
        return $this->belongsTo(Cheque::class);
    }

    public function categoryAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'category_account_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
