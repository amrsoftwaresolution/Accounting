<?php

namespace Tests\Feature;

use App\Models\ChartOfAcc;
use App\Models\Company;
use App\Models\Currency;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportCompanyIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_profit_loss_report_only_includes_the_active_company(): void
    {
        $currency = Currency::create([
            'name' => 'Sri Lankan Rupee',
            'code' => 'LKR',
            'symbol' => 'Rs.',
            'exchange_rate' => 1,
            'is_base_currency' => true,
        ]);

        $user = User::factory()->create();
        $companyA = Company::create([
            'company_name' => 'Company A',
            'company_email' => 'a@example.com',
            'currency_id' => $currency->id,
        ]);
        $companyB = Company::create([
            'company_name' => 'Company B',
            'company_email' => 'b@example.com',
            'currency_id' => $currency->id,
        ]);

        $incomeA = ChartOfAcc::create([
            'company_id' => $companyA->id,
            'account_code' => '4000',
            'name' => 'Revenue A',
            'account_type' => 'income',
            'sub_type' => 'income',
            'balance' => 0,
            'currency' => 'LKR',
            'description' => null,
            'is_active' => true,
            'parent_id' => null,
            'is_locked' => true,
        ]);

        $incomeB = ChartOfAcc::create([
            'company_id' => $companyB->id,
            'account_code' => '4001',
            'name' => 'Revenue B',
            'account_type' => 'income',
            'sub_type' => 'income',
            'balance' => 0,
            'currency' => 'LKR',
            'description' => null,
            'is_active' => true,
            'parent_id' => null,
            'is_locked' => true,
        ]);

        $entryA = JournalEntry::create([
            'company_id' => $companyA->id,
            'date' => now()->toDateString(),
            'reference' => 'JE-A',
            'description' => 'Revenue A entry',
            'transaction_type' => 'journal_entry',
            'transactionable_id' => null,
            'transactionable_type' => null,
            'payee_id' => null,
            'payee_type' => null,
            'payment_method_id' => null,
            'total_amount' => 100,
            'status' => 'posted',
            'created_by' => $user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entryA->id,
            'chart_of_acc_id' => $incomeA->id,
            'payee_id' => null,
            'payee_type' => null,
            'debit' => 0,
            'credit' => 100,
            'memo' => 'Revenue A line',
        ]);

        $entryB = JournalEntry::create([
            'company_id' => $companyB->id,
            'date' => now()->toDateString(),
            'reference' => 'JE-B',
            'description' => 'Revenue B entry',
            'transaction_type' => 'journal_entry',
            'transactionable_id' => null,
            'transactionable_type' => null,
            'payee_id' => null,
            'payee_type' => null,
            'payment_method_id' => null,
            'total_amount' => 500,
            'status' => 'posted',
            'created_by' => $user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entryB->id,
            'chart_of_acc_id' => $incomeB->id,
            'payee_id' => null,
            'payee_type' => null,
            'debit' => 0,
            'credit' => 500,
            'memo' => 'Revenue B line',
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_company_id' => $companyA->id])
            ->get(route('reports.profit-loss'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('reportData.income', 1)
                ->where('reportData.income.0.name', 'Revenue A')
                ->where('reportData.income.0.balance', 100)
            );
    }

    public function test_balance_sheet_report_only_includes_the_active_company(): void
    {
        $currency = Currency::create([
            'name' => 'Sri Lankan Rupee',
            'code' => 'LKR',
            'symbol' => 'Rs.',
            'exchange_rate' => 1,
            'is_base_currency' => true,
        ]);

        $user = User::factory()->create();
        $companyA = Company::create([
            'company_name' => 'Company A',
            'company_email' => 'a@example.com',
            'currency_id' => $currency->id,
        ]);
        $companyB = Company::create([
            'company_name' => 'Company B',
            'company_email' => 'b@example.com',
            'currency_id' => $currency->id,
        ]);

        $assetA = ChartOfAcc::create([
            'company_id' => $companyA->id,
            'account_code' => '1000',
            'name' => 'Cash A',
            'account_type' => 'asset',
            'sub_type' => 'cash',
            'balance' => 0,
            'currency' => 'LKR',
            'description' => null,
            'is_active' => true,
            'parent_id' => null,
            'is_locked' => true,
        ]);

        $assetB = ChartOfAcc::create([
            'company_id' => $companyB->id,
            'account_code' => '1001',
            'name' => 'Cash B',
            'account_type' => 'asset',
            'sub_type' => 'cash',
            'balance' => 0,
            'currency' => 'LKR',
            'description' => null,
            'is_active' => true,
            'parent_id' => null,
            'is_locked' => true,
        ]);

        $entryA = JournalEntry::create([
            'company_id' => $companyA->id,
            'date' => now()->toDateString(),
            'reference' => 'BS-A',
            'description' => 'Asset A entry',
            'transaction_type' => 'journal_entry',
            'transactionable_id' => null,
            'transactionable_type' => null,
            'payee_id' => null,
            'payee_type' => null,
            'payment_method_id' => null,
            'total_amount' => 150,
            'status' => 'posted',
            'created_by' => $user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entryA->id,
            'chart_of_acc_id' => $assetA->id,
            'payee_id' => null,
            'payee_type' => null,
            'debit' => 150,
            'credit' => 0,
            'memo' => 'Asset A line',
        ]);

        $entryB = JournalEntry::create([
            'company_id' => $companyB->id,
            'date' => now()->toDateString(),
            'reference' => 'BS-B',
            'description' => 'Asset B entry',
            'transaction_type' => 'journal_entry',
            'transactionable_id' => null,
            'transactionable_type' => null,
            'payee_id' => null,
            'payee_type' => null,
            'payment_method_id' => null,
            'total_amount' => 700,
            'status' => 'posted',
            'created_by' => $user->id,
        ]);

        JournalEntryLine::create([
            'journal_entry_id' => $entryB->id,
            'chart_of_acc_id' => $assetB->id,
            'payee_id' => null,
            'payee_type' => null,
            'debit' => 700,
            'credit' => 0,
            'memo' => 'Asset B line',
        ]);

        $response = $this->actingAs($user)
            ->withSession(['active_company_id' => $companyA->id])
            ->get(route('reports.balance-sheet'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('reportData.asset', 1)
                ->where('reportData.asset.0.name', 'Cash A')
                ->where('reportData.asset.0.balance', 150)
            );
    }
}
