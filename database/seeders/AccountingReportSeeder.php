<?php

namespace Database\Seeders;

use App\Models\Accounting\ChartOfAcc;
use App\Models\Accounting\JournalEntry;
use App\Models\Accounting\JournalEntryLine;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountingReportSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@example.com')->first();
        if (! $adminUser) {
            return;
        }

        $customer = Customer::first();
        $supplier = Supplier::firstOrCreate(
            ['company_name' => 'Sample Supplies Co.'],
            [
                'display_name' => 'Sample Supplies Co.',
                'email' => 'supplier@example.com',
                'phone_number' => '+94 11 987 6543',
                'address' => '45 Supply Street, Colombo',
                'opening_balance' => 0,
            ]
        );

        $cashOnHand = ChartOfAcc::where('name', 'Cash on Hand')->first();
        $chequeInHand = ChartOfAcc::where('name', 'Cheque in Hand')->first();
        $mainBank = ChartOfAcc::where('name', 'Main Bank Account')->first();
        $accountsReceivable = ChartOfAcc::where('name', 'Accounts Receivable')->first();
        $inventoryAsset = ChartOfAcc::where('name', 'Inventory Asset')->first();
        $accountsPayable = ChartOfAcc::where('name', 'Accounts Payable')->first();
        $creditCard = ChartOfAcc::where('name', 'Credit Card')->first();
        $openingBalanceEquity = ChartOfAcc::where('name', 'Opening Balance Equity')->first();
        $retainedEarnings = ChartOfAcc::where('name', 'Retained Earnings')->first();
        $salesIncome = ChartOfAcc::where('name', 'Sales Income')->first();
        $serviceIncome = ChartOfAcc::where('name', 'Service Income')->first();
        $cogs = ChartOfAcc::where('name', 'Cost of Goods Sold')->first();
        $rentExpense = ChartOfAcc::where('name', 'Rent Expense')->first();
        $utilitiesExpense = ChartOfAcc::where('name', 'Utilities Expense')->first();
        $officeExpense = ChartOfAcc::where('name', 'Office Expense')->first();

        $requiredAccounts = [
            'cashOnHand' => $cashOnHand,
            'chequeInHand' => $chequeInHand,
            'accountsReceivable' => $accountsReceivable,
            'inventoryAsset' => $inventoryAsset,
            'accountsPayable' => $accountsPayable,
            'creditCard' => $creditCard,
            'openingBalanceEquity' => $openingBalanceEquity,
            'salesIncome' => $salesIncome,
            'serviceIncome' => $serviceIncome,
            'cogs' => $cogs,
            'rentExpense' => $rentExpense,
            'utilitiesExpense' => $utilitiesExpense,
            'officeExpense' => $officeExpense,
        ];

        foreach ($requiredAccounts as $key => $account) {
            if (! $account) {
                return;
            }
        }

        DB::transaction(function () use (
            $adminUser,
            $customer,
            $supplier,
            $cashOnHand,
            $chequeInHand,
            $accountsReceivable,
            $inventoryAsset,
            $accountsPayable,
            $creditCard,
            $openingBalanceEquity,
            $salesIncome,
            $serviceIncome,
            $cogs,
            $rentExpense,
            $utilitiesExpense,
            $officeExpense
        ) {
            $entries = [
                [
                    'date' => '2025-12-31',
                    'reference' => 'OPENING-2025',
                    'description' => 'Opening balance for prior year',
                    'transaction_type' => 'opening_balance',
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $cashOnHand->id, 'debit' => 10000, 'credit' => 0],
                        ['chart_of_acc_id' => $openingBalanceEquity->id, 'debit' => 0, 'credit' => 10000],
                    ],
                ],
                [
                    'date' => '2025-12-10',
                    'reference' => 'SALE-2025-001',
                    'description' => 'Prior year service sale',
                    'transaction_type' => 'sale',
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $cashOnHand->id, 'debit' => 7000, 'credit' => 0],
                        ['chart_of_acc_id' => $salesIncome->id, 'debit' => 0, 'credit' => 7000],
                    ],
                ],
                [
                    'date' => '2025-12-20',
                    'reference' => 'EXP-2025-001',
                    'description' => 'Prior year rent payment',
                    'transaction_type' => 'expense',
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $rentExpense->id, 'debit' => 2000, 'credit' => 0],
                        ['chart_of_acc_id' => $cashOnHand->id, 'debit' => 0, 'credit' => 2000],
                    ],
                ],
                [
                    'date' => '2026-05-10',
                    'reference' => 'INV-2026-001',
                    'description' => 'Current year service invoice on account',
                    'transaction_type' => 'invoice',
                    'payee_id' => $customer->id,
                    'payee_type' => Customer::class,
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $accountsReceivable->id, 'debit' => 12000, 'credit' => 0, 'payee_id' => $customer->id, 'payee_type' => Customer::class],
                        ['chart_of_acc_id' => $serviceIncome->id, 'debit' => 0, 'credit' => 12000],
                    ],
                ],
                [
                    'date' => '2026-05-10',
                    'reference' => 'COGS-2026-001',
                    'description' => 'Cost of goods sold for current invoice',
                    'transaction_type' => 'cogs',
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $cogs->id, 'debit' => 4000, 'credit' => 0],
                        ['chart_of_acc_id' => $inventoryAsset->id, 'debit' => 0, 'credit' => 4000],
                    ],
                ],
                [
                    'date' => '2026-05-12',
                    'reference' => 'BILL-2026-001',
                    'description' => 'Inventory purchase on account',
                    'transaction_type' => 'bill',
                    'payee_id' => $supplier->id,
                    'payee_type' => Supplier::class,
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $inventoryAsset->id, 'debit' => 6000, 'credit' => 0],
                        ['chart_of_acc_id' => $accountsPayable->id, 'debit' => 0, 'credit' => 6000, 'payee_id' => $supplier->id, 'payee_type' => Supplier::class],
                    ],
                ],
                [
                    'date' => '2026-05-20',
                    'reference' => 'BILL-PAY-2026-001',
                    'description' => 'Partial payment for supplier bill',
                    'transaction_type' => 'payment',
                    'payee_id' => $supplier->id,
                    'payee_type' => Supplier::class,
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $accountsPayable->id, 'debit' => 2000, 'credit' => 0, 'payee_id' => $supplier->id, 'payee_type' => Supplier::class],
                        ['chart_of_acc_id' => $cashOnHand->id, 'debit' => 0, 'credit' => 2000],
                    ],
                ],
                [
                    'date' => '2026-05-25',
                    'reference' => 'PAYMENT-2026-001',
                    'description' => 'Customer payment against outstanding invoice',
                    'transaction_type' => 'payment',
                    'payee_id' => $customer->id,
                    'payee_type' => Customer::class,
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $cashOnHand->id, 'debit' => 8000, 'credit' => 0],
                        ['chart_of_acc_id' => $accountsReceivable->id, 'debit' => 0, 'credit' => 8000, 'payee_id' => $customer->id, 'payee_type' => Customer::class],
                    ],
                ],
                [
                    'date' => '2026-05-27',
                    'reference' => 'EXP-2026-001',
                    'description' => 'Office expense paid from cash',
                    'transaction_type' => 'expense',
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $officeExpense->id, 'debit' => 1200, 'credit' => 0],
                        ['chart_of_acc_id' => $cashOnHand->id, 'debit' => 0, 'credit' => 1200],
                    ],
                ],
                [
                    'date' => '2026-05-28',
                    'reference' => 'EXP-2026-002',
                    'description' => 'Utilities expense charged to credit card',
                    'transaction_type' => 'expense',
                    'created_by' => $adminUser->id,
                    'lines' => [
                        ['chart_of_acc_id' => $utilitiesExpense->id, 'debit' => 800, 'credit' => 0],
                        ['chart_of_acc_id' => $creditCard->id, 'debit' => 0, 'credit' => 800],
                    ],
                ],
            ];

            foreach ($entries as $entryData) {
                $lines = $entryData['lines'];
                unset($entryData['lines']);
                $journalEntry = JournalEntry::create($entryData);

                foreach ($lines as $lineData) {
                    $journalEntry->lines()->create($lineData);
                }
            }
        });
    }
}
