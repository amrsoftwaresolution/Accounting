<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class Cheque extends Model implements Auditable
{
    use HasUuids, \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $fillable = [
        'payee_id',
        'payee_type',
        'bank_account_id',
        'payment_date',
        'cheque_no',
        'total_amount',
        'mailing_address',
        'memo',
        'status',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function payee()
    {
        return $this->morphTo();
    }

    public function bankAccount()
    {
        return $this->belongsTo(ChartOfAcc::class, 'bank_account_id');
    }

    public function lines()
    {
        return $this->hasMany(ChequeLine::class)->orderBy('line_order');
    }
}
