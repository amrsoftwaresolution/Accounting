<?php

namespace Tests\Feature;

use App\Models\ChartOfAcc;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuickAccessSaveRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_bill_save_redirects_back_instead_of_opening_edit_page(): void
    {
        $user = User::create([
            'name' => 'Quick Access Tester',
            'email' => 'quick-access@example.com',
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
            'company_name' => 'Quick Access Company',
            'company_email' => 'qa@example.com',
            'currency_id' => $currency->id,
            'is_onboarded' => true,
        ]);

        $supplier = Supplier::create([
            'company_id' => $company->id,
            'display_name' => 'Quick Access Supplier',
            'company_name' => 'Quick Access Supplier',
            'email' => 'supplier@example.com',
            'phone_number' => '1234567890',
            'tax_id' => 'TAX-1',
            'opening_balance' => 0,
        ]);

        $expenseAccount = ChartOfAcc::create([
            'company_id' => $company->id,
            'account_code' => '5001',
            'name' => 'Test Expense Account',
            'account_type' => 'expense',
            'sub_type' => 'expense',
            'balance' => 0,
            'currency' => 'USD',
            'is_active' => true,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_company_id' => $company->id])
            ->from(route('bill'))
            ->post(route('bill.store'), [
                'supplier' => $supplier->id,
                'billDate' => '2026-06-10',
                'dueDate' => '2026-06-25',
                'billNo' => '1001',
                'memo' => 'Quick access save test',
                'items' => [
                    [
                        'category' => $expenseAccount->id,
                        'description' => 'Setup expense',
                        'amount' => '25.00',
                    ],
                ],
                'itemDetails' => [],
                'action' => 'save',
            ]);

        $response->assertOk()
            ->assertJson(['message' => 'Bill saved successfully.']);
    }
}
