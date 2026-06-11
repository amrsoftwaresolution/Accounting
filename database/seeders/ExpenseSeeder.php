<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\PaymentMethod;
use App\Models\Expense;
use App\Models\ExpenseItem;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use Carbon\Carbon;

class ExpenseSeeder extends Seeder
{
    public function run()
    {
        $companies = Company::all();
        $user = User::first();

        foreach ($companies as $company) {
            $companyId = $company->id;

            // Get required dependencies
            $supplier = Supplier::where('company_id', $companyId)->first();
            if (!$supplier) {
                $supplier = Supplier::create([
                    'company_id' => $companyId,
                    'first_name' => 'Sample',
                    'last_name' => 'Supplier',
                    'display_name' => 'Sample Supplier',
                    'email' => 'supplier@example.com',
                ]);
            }

            $paymentMethod = PaymentMethod::where('is_active', true)
                ->where(function ($query) use ($companyId) {
                    $query->whereNull('company_id')
                          ->orWhere('company_id', $companyId);
                })->first();

            // Default Accounts
            $cashAccount = ChartOfAcc::where('company_id', $companyId)
                ->where('account_type', 'asset')
                ->where('sub_type', 'cash')
                ->first() ?? ChartOfAcc::getOrCreateDefault('inventory', $companyId); // Just a fallback if no cash

            $expenseAccount = ChartOfAcc::where('company_id', $companyId)
                ->where('account_type', 'expense')
                ->first() ?? ChartOfAcc::getOrCreateDefault('uncategorized-expense', $companyId);

            for ($i = 1; $i <= 5; $i++) {
                $amount = rand(100, 500) + (rand(0, 99) / 100);
                $date = Carbon::now()->subDays(rand(1, 30))->format('Y-m-d');
                $refNo = 'EXP-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $memo = "Sample Expense $i for Company $company->company_name";

                // 1. Create Expense
                $expense = Expense::create([
                    'company_id' => $companyId,
                    'payee_id' => $supplier->id,
                    'payee_type' => Supplier::class,
                    'payment_account_id' => $cashAccount->id,
                    'payment_date' => $date,
                    'payment_method_id' => $paymentMethod?->id,
                    'reference_no' => $refNo,
                    'total_amount' => $amount,
                    'memo' => $memo,
                    'status' => 'posted',
                ]);

                // 2. Create Expense Item
                ExpenseItem::create([
                    'expense_id' => $expense->id,
                    'chart_of_acc_id' => $expenseAccount->id,
                    'description' => "Sample Item $i",
                    'quantity' => 1,
                    'rate' => $amount,
                    'amount' => $amount,
                ]);

                // 3. Create Journal Entry
                $journalEntry = JournalEntry::create([
                    'company_id' => $companyId,
                    'date' => $date,
                    'reference' => $refNo,
                    'description' => $memo,
                    'transaction_type' => 'expense',
                    'payee_id' => $supplier->id,
                    'payee_type' => Supplier::class,
                    'total_amount' => $amount,
                    'status' => 'posted',
                    'created_by' => $user?->id,
                    'transactionable_id' => $expense->id,
                    'transactionable_type' => Expense::class,
                ]);

                // Expense Account (Debit)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $expenseAccount->id,
                    'debit' => $amount,
                    'credit' => 0,
                    'memo' => "Sample Item $i",
                ]);

                // Payment Account (Credit)
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'chart_of_acc_id' => $cashAccount->id,
                    'debit' => 0,
                    'credit' => $amount,
                    'memo' => $memo,
                ]);
            }
        }
    }
}
