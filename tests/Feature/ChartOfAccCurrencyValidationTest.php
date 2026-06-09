<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChartOfAccCurrencyValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_account_currency_is_required_when_multi_currency_is_enabled(): void
    {
        $user = User::create([
            'name' => 'Currency Tester',
            'email' => 'currency-tester@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $currency = Currency::create([
            'name' => 'US Dollar',
            'code' => 'USD',
            'symbol' => '$',
            'exchange_rate' => 1,
            'is_base_currency' => true,
        ]);

        $company = Company::create([
            'company_name' => 'Multi Currency Company',
            'company_email' => 'multi@example.com',
            'currency_id' => $currency->id,
            'multicurrency' => true,
            'is_onboarded' => true,
        ]);

        $this->actingAs($user)
            ->withSession(['active_company_id' => $company->id])
            ->post(route('chart-of-account.store'), [
                'account_code' => '1001',
                'name' => 'Test Currency Account',
                'account_type' => 'asset',
                'sub_type' => 'cash-and-cash-equivalents',
                'description' => 'Currency validation test',
                'opening_balance' => '0',
                'is_active' => true,
                'currency' => '',
            ])
            ->assertSessionHasErrors('currency');
    }
}
