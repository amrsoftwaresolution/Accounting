<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;

class TenancySetupCommand extends Command
{
    protected $signature = 'tenancy:setup {name : The name of the first tenant} {domain : The domain/subdomain for the first tenant}';
    protected $description = 'Initial multi-tenancy setup for the application';

    public function handle()
    {
        $this->info('Starting Tenancy Setup...');

        $name = $this->argument('name');
        $domain = $this->argument('domain');

        $this->info("Creating tenant: {$name} ({$domain})...");

        $tenant = Tenant::create([
            'id' => strtolower(str_replace(' ', '-', $name)),
            'name' => $name,
        ]);

        $tenant->domains()->create(['domain' => $domain]);

        $this->info('Tenant created successfully!');
        $this->info('Database created and migrations run for the tenant.');
        $this->info("Access the tenant at: http://{$domain}");
    }
}
