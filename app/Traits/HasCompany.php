<?php

namespace App\Traits;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

trait HasCompany
{
    public static function bootHasCompany()
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function (Model $model) {
            if (session()->has('active_company_id') && !$model->company_id) {
                $model->company_id = session('active_company_id');
            }
        });
    }
}
