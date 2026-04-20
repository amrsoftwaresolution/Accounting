<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name', // Add a name column for the company name
        ];
    }

    public static function booted()
{
    static::creating(function ($tenant) {
        $name = request()->company ?? 'tenant';

        $clean = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $name));

        $tenant->id = $clean; // ❗ REMOVE uniqid()
    });
}
//STORING TENANT DB NAME
public function getDatabaseName()
{
    return $this->id;
}


}
