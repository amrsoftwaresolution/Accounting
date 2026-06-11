<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayBillPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_pay_bill_page_is_available_from_the_supplier_quick_actions(): void
    {
        $user = User::create([
            'name' => 'Pay Bill Tester',
            'email' => 'pay-bill@example.com',
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
            'company_name' => 'Pay Bill Company',
            'company_email' => 'pay-bill-company@example.com',
            'currency_id' => $currency->id,
            'is_onboarded' => true,
        ]);

        $this->actingAs($user)
            ->withSession(['active_company_id' => $company->id])
            ->get(route('pay-bill'))
            ->assertOk()
            ->assertSee('Pay Bill');
    }
}
