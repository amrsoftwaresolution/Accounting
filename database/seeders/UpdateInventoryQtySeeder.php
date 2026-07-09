<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\InvoiceItem;
use App\Models\SalesReceiptItem;
use App\Models\SupplierCreditNoteItem;
use App\Models\BillItem;
use App\Models\ExpenseItem;
use App\Models\CreditNoteItem;
use Illuminate\Support\Facades\DB;

class UpdateInventoryQtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $companyId = 4;
        
        $items = Item::where('company_id', $companyId)->where('type', 'inventory')->get();
        
        $this->command->info("Found {$items->count()} inventory items for company {$companyId}. Starting recalculation...");

        foreach ($items as $item) {
            $itemId = $item->id;
            
            // Calculate Increases
            $billQty = DB::table('bill_items')
                ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
                ->where('bills.company_id', $companyId)
                ->where('bill_items.item_id', $itemId)
                ->sum('bill_items.quantity');
                
            $expenseQty = DB::table('expense_items')
                ->join('expenses', 'expense_items.expense_id', '=', 'expenses.id')
                ->where('expenses.company_id', $companyId)
                ->where('expense_items.item_id', $itemId)
                ->sum('expense_items.quantity');
                
            $creditNoteQty = DB::table('credit_note_items')
                ->join('credit_notes', 'credit_note_items.credit_note_id', '=', 'credit_notes.id')
                ->where('credit_notes.company_id', $companyId)
                ->where('credit_note_items.item_id', $itemId)
                ->sum('credit_note_items.quantity');
                
            $totalIncreases = $billQty + $expenseQty + $creditNoteQty;
            
            // Calculate Decreases
            $invoiceQty = DB::table('invoice_items')
                ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
                ->where('invoices.company_id', $companyId)
                ->where('invoice_items.item_id', $itemId)
                ->sum('invoice_items.quantity');
                
            $salesReceiptQty = DB::table('sales_receipt_items')
                ->join('sales_receipts', 'sales_receipt_items.sales_receipt_id', '=', 'sales_receipts.id')
                ->where('sales_receipts.company_id', $companyId)
                ->where('sales_receipt_items.item_id', $itemId)
                ->sum('sales_receipt_items.quantity');
                
            $supplierCreditQty = DB::table('supplier_credit_note_items')
                ->join('supplier_credit_notes', 'supplier_credit_note_items.supplier_credit_note_id', '=', 'supplier_credit_notes.id')
                ->where('supplier_credit_notes.company_id', $companyId)
                ->where('supplier_credit_note_items.item_id', $itemId)
                ->sum('supplier_credit_note_items.quantity');
                
            $totalDecreases = $invoiceQty + $salesReceiptQty + $supplierCreditQty;
            
            // Current Qty
            $newQty = $totalIncreases - $totalDecreases;
            
            $item->update(['quantity_on_hand' => $newQty]);
            
            $this->command->info("Item ID {$itemId} ({$item->name}): Increments ({$totalIncreases}) - Decrements ({$totalDecreases}) = New Qty: {$newQty}");
        }
        
        $this->command->info('Inventory quantity recalculation completed for company 4.');
    }
}
