<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAcc;
use App\Models\InventoryQuantityAdjustment;
use App\Models\Item;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventoryQuantityAdjustmentController extends Controller
{
    public function create()
    {
        $companyId = session('active_company_id') ?? auth()->user()->company_id;

        $items = Item::where('company_id', $companyId)
            ->where('track_inventory', true)
            ->get(['id', 'name', 'sku', 'description', 'quantity_on_hand']);
            
        $accounts = ChartOfAcc::where('company_id', $companyId)->get(['id', 'name', 'account_code']);

        $lastRef = InventoryQuantityAdjustment::where('company_id', $companyId)
            ->whereNotNull('reference_number')
            ->orderByRaw('CAST(reference_number AS UNSIGNED) DESC')
            ->first();
            
        $nextRef = ($lastRef && is_numeric($lastRef->reference_number)) ? (int) $lastRef->reference_number + 1 : 1;

        return Inertia::render('Inventory/QuantityAdjustment/Create', [
            'items' => $items,
            'accounts' => $accounts,
            'nextReference' => (string) $nextRef,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'adjustment_date' => 'required|date',
            'reference_number' => 'nullable|string|max:255',
            'adjustment_reason' => 'required|string|max:255',
            'inventory_adjustment_account_id' => 'required|exists:chart_of_accs,id',
            'memo' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.description' => 'nullable|string|max:255',
            'items.*.qty_on_hand' => 'required|numeric',
            'items.*.new_qty' => 'required|numeric',
            'items.*.change_in_qty' => 'required|numeric',
        ]);

        $companyId = session('active_company_id') ?? auth()->user()->company_id;

        try {
            $journalEntry = null;
            DB::transaction(function () use ($validated, $companyId, &$journalEntry) {
                $adjustment = InventoryQuantityAdjustment::create([
                    'company_id' => $companyId,
                    'adjustment_date' => $validated['adjustment_date'],
                    'reference_number' => $validated['reference_number'] ?? null,
                    'adjustment_reason' => $validated['adjustment_reason'],
                    'inventory_adjustment_account_id' => $validated['inventory_adjustment_account_id'],
                    'memo' => $validated['memo'] ?? null,
                ]);

                $journalLines = [];
                $totalAmount = 0.0;

                foreach ($validated['items'] as $itemData) {
                    $adjustment->items()->create([
                        'item_id' => $itemData['item_id'],
                        'description' => $itemData['description'] ?? null,
                        'qty_on_hand' => $itemData['qty_on_hand'],
                        'new_qty' => $itemData['new_qty'],
                        'change_in_qty' => $itemData['change_in_qty'],
                    ]);

                    // Update the quantity_on_hand in the Item model
                    $item = Item::where('company_id', $companyId)->findOrFail($itemData['item_id']);
                    $item->quantity_on_hand = $itemData['new_qty'];
                    $item->save();

                    $changeInQty = (float) $itemData['change_in_qty'];
                    if ($changeInQty != 0) {
                        $cost = (float) $item->purchase_price;
                        $lineVal = abs($changeInQty) * $cost;
                        $totalAmount += $lineVal;

                        // Find the item's inventory asset account
                        $inventoryAccountId = $item->inventory_account_id ?? 
                            (ChartOfAcc::where('company_id', $companyId)->where('sub_type', 'inventory')->first()?->id ?? 
                             ChartOfAcc::getOrCreateDefault('inventory', $companyId)->id);

                        $lineMemo = "Inventory Qty Adj: " . $item->name . ($itemData['description'] ? ' (' . $itemData['description'] . ')' : '');

                        if ($changeInQty > 0) {
                            // Inventory Increase:
                            // Debit: Inventory Asset Account
                            // Credit: Inventory Adjustment Account
                            $journalLines[] = [
                                'chart_of_acc_id' => $inventoryAccountId,
                                'debit' => $lineVal,
                                'credit' => 0,
                                'memo' => $lineMemo,
                            ];
                            $journalLines[] = [
                                'chart_of_acc_id' => $validated['inventory_adjustment_account_id'],
                                'debit' => 0,
                                'credit' => $lineVal,
                                'memo' => $lineMemo,
                            ];
                        } else {
                            // Inventory Decrease:
                            // Debit: Inventory Adjustment Account
                            // Credit: Inventory Asset Account
                            $journalLines[] = [
                                'chart_of_acc_id' => $validated['inventory_adjustment_account_id'],
                                'debit' => $lineVal,
                                'credit' => 0,
                                'memo' => $lineMemo,
                            ];
                            $journalLines[] = [
                                'chart_of_acc_id' => $inventoryAccountId,
                                'debit' => 0,
                                'credit' => $lineVal,
                                'memo' => $lineMemo,
                            ];
                        }
                    }
                }

                // Create the Journal Entry if there is any adjustment value
                if ($totalAmount > 0) {
                    $journalEntry = JournalEntry::create([
                        'company_id' => $companyId,
                        'date' => $validated['adjustment_date'],
                        'reference' => $validated['reference_number'] ?? 'ADJ-' . time(),
                        'description' => $validated['memo'] ?? ('Inventory quantity adjustment - ' . $validated['adjustment_reason']),
                        'transaction_type' => 'inventory_adjustment',
                        'total_amount' => $totalAmount,
                        'status' => 'posted',
                        'created_by' => Auth::id(),
                        'transactionable_id' => $adjustment->id,
                        'transactionable_type' => InventoryQuantityAdjustment::class,
                    ]);

                    foreach ($journalLines as $line) {
                        $journalEntry->lines()->create($line);
                    }
                }
            });
            $action = $request->input('action', 'save');

            if ($action === 'new') {
                return redirect()->route('inventory-adjustment')->with('success', 'Inventory quantity adjustment saved successfully.');
            }

            if ($action === 'close') {
                return redirect()->route('dashboard')->with('success', 'Inventory quantity adjustment saved successfully.');
            }

            if (isset($journalEntry)) {
                return redirect()->route('journal-entries.edit', $journalEntry->id)->with('success', 'Inventory quantity adjustment saved successfully.');
            }

            return redirect()->back()->with('success', 'Inventory quantity adjustment saved successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
