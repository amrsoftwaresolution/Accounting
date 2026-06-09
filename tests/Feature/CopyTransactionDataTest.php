<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CopyTransactionDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_journal_entry_delete_redirects_to_history_page(): void
    {
        $user = User::create([
            'name' => 'Delete Tester',
            'email' => 'delete-tester@example.com',
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
            'company_name' => 'Delete Test Company',
            'company_email' => 'delete-company@example.com',
            'currency_id' => $currency->id,
            'is_onboarded' => true,
        ]);

        $journalEntry = JournalEntry::create([
            'company_id' => $company->id,
            'date' => '2026-06-09',
            'reference' => '2001',
            'description' => 'Delete me',
            'transaction_type' => 'journal_entry',
            'status' => 'posted',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->withSession(['active_company_id' => $company->id])
            ->from('/account-history/123')
            ->delete(route('journal-entries.destroy', $journalEntry))
            ->assertRedirect('/account-history/123')
            ->assertSessionHas('success', 'Journal Entry deleted successfully.');
    }

    public function test_invoice_create_page_can_prefill_data_from_copy_request(): void
    {
        $user = User::create([
            'name' => 'Copy Tester',
            'email' => 'copy-tester@example.com',
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
            'company_name' => 'Copy Test Company',
            'company_email' => 'copy-company@example.com',
            'currency_id' => $currency->id,
            'is_onboarded' => true,
        ]);

        $journalEntry = JournalEntry::create([
            'company_id' => $company->id,
            'date' => '2026-06-09',
            'reference' => '1001',
            'description' => 'Copied invoice memo',
            'transaction_type' => 'invoice',
            'status' => 'posted',
            'created_by' => $user->id,
        ]);

        $customer = Customer::create([
            'company_id' => $company->id,
            'display_name' => 'Copy Customer',
            'first_name' => 'Copy',
            'last_name' => 'Customer',
            'email' => 'customer@example.com',
        ]);

        $invoice = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'email' => 'copy@example.com',
            'billing_address' => '123 Copy Street',
            'terms' => 'Net 30',
            'invoice_date' => '2026-06-09',
            'due_date' => '2026-07-09',
            'invoice_no' => '1001',
            'total_amount' => 125.50,
            'memo' => 'Copied invoice memo',
            'statement_message' => 'Thank you for your business',
            'status' => 'posted',
        ]);

        $journalEntry->update([
            'transactionable_id' => $invoice->id,
            'transactionable_type' => Invoice::class,
            'payee_id' => null,
            'payee_type' => null,
        ]);

        $this->actingAs($user)
            ->withSession(['active_company_id' => $company->id])
            ->get(route('invoice', ['copy' => $journalEntry->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Transaction/InvoiceForm')
                ->where('invoice.id', null)
                ->where('invoice.memo', 'Copied invoice memo')
                ->where('invoice.invoiceNo', '1002')
                ->where('invoice.email', 'copy@example.com')
            );
    }
}
