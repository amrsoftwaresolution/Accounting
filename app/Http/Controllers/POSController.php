<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Item;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Accounting\ChartOfAcc;
use App\Models\Accounting\JournalEntry;
use App\Models\Accounting\SalesInvoice;

class POSController extends Controller
{
    public function index()
    {
        // Fetch Items (Inventory, Service, Bundle, Non-Inventory)
        $items = Item::query()
            ->whereIn('type', ['inventory', 'service', 'bundle', 'non-inventory'])
            ->orderBy('name')
            ->get();

        $paymentMethods = $this->paymentMethods();

        return Inertia::render('POS/Index', [
            'items' => $items,
            'paymentMethods' => $paymentMethods,
            'nextReceiptNo' => $this->getNextReceiptNo(),
            'existingReceipt' => null,
        ]);
    }

    public function edit(JournalEntry $journalEntry)
    {
        $journalEntry->load('lines');
        $receipt = SalesInvoice::find($journalEntry->transactionable_id);

        if (!$receipt) {
            abort(404, 'Sales invoice not found');
        }

        // Fetch Items (Inventory, Service, Bundle, Non-Inventory)
        $items = Item::query()
            ->whereIn('type', ['inventory', 'service', 'bundle', 'non-inventory'])
            ->orderBy('name')
            ->get();

        $paymentMethods = $this->paymentMethods();

        // Calculate repairing cost if any (from lines)
        $serviceIncomeAcc = ChartOfAcc::getOrCreateDefault('service-income')->id;
        $repairingCostLine = $journalEntry->lines->where('chart_of_acc_id', $serviceIncomeAcc)->first();
        $repairingCost = $repairingCostLine ? $repairingCostLine->credit : 0;

        $receiptData = [
            'id' => $journalEntry->id,
            'receipt_id' => $receipt->id,
            'customer' => $receipt->customer_id,
            'vehicle_id' => $receipt->vehicle_id,
            'email' => $receipt->email,
            'receiptDate' => $receipt->receipt_date,
            'receiptNo' => $receipt->receipt_no,
            'paymentMethod' => $receipt->payment_method_id,
            'depositTo' => $receipt->deposit_to_account_id,
            'memo' => $receipt->memo,
            'statementMessage' => $receipt->statement_message,
            'repairingCost' => $repairingCost,
            'items' => $receipt->items->map(function ($item) {
                return [
                    'product' => $item->item_id,
                    'name' => $item->item->name ?? '',
                    'description' => $item->description,
                    'qty' => $item->quantity,
                    'rate' => number_format($item->rate, 2, '.', ''),
                    'amount' => number_format($item->amount, 2, '.', ''),
                    'discount' => 0,
                ];
            })->toArray(),
        ];

        return Inertia::render('POS/Index', [
            'items' => $items,
            'paymentMethods' => $paymentMethods,
            'nextReceiptNo' => $receipt->receipt_no,
            'existingReceipt' => $receiptData,
        ]);
    }

    private function getNextReceiptNo()
    {
        $lastReceipt = \App\Models\Accounting\SalesInvoice::query()->latest()->first();
        $number = 1;
        if ($lastReceipt && preg_match('/\d+/', $lastReceipt->receipt_no, $matches)) {
            $number = (int)$matches[0] + 1;
        }
        return 'RCPT-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
