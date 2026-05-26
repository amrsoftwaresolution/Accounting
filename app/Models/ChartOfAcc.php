<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Traits\HasCompany;

class ChartOfAcc extends Model
{
    use HasUuids, HasCompany;

    protected $fillable = [
        'company_id',
        'account_code',
        'name',
        'account_type',
        'sub_type',
        'balance',
        'currency',
        'description',
        'is_active',
        'parent_id',
        'is_locked',
    ];

    public function parent()
    {
        return $this->belongsTo(ChartOfAcc::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ChartOfAcc::class, 'parent_id');
    }

    /**
     * Adjust account balance based on its type.
     * Assets & Expenses: Debit (+), Credit (-)
     * Liabilities, Equity, Income: Credit (+), Debit (-)
     */
    public static function adjustBalance($accountId, $debit, $credit)
    {
        $account = self::find($accountId);
        if (!$account) return;

        $impact = 0;
        $type = strtolower($account->account_type);

        if (in_array($type, ['asset', 'expense'])) {
            $impact = $debit - $credit;
        } else {
            $impact = $credit - $debit;
        }

        $account->increment('balance', $impact);
        
        return $account->balance;
    }
}
