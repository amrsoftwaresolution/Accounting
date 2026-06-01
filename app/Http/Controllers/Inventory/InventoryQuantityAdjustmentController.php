<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAcc;
use App\Models\InventoryQuantityAdjustment;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryQuantityAdjustmentController extends Controller
{
    public function create()
    {
        $companyId = auth()->user()->company_id;

        $items = Item::where('company_id', $companyId)
            ->where('track_inventory', true)
            ->get(['id', 'name', 'sku', 'description', 'quantity_on_hand']);
            
        $accounts = ChartOfAcc::where('company_id', $companyId)->get(['id', 'name', 'account_code']);

        return Inertia::render('Inventory/QuantityAdjustment/Create', [
            'items' => $items,
            'accounts' => $accounts,
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

        $companyId = auth()->user()->company_id;

        DB::transaction(function () use ($validated, $companyId) {
            $adjustment = InventoryQuantityAdjustment::create([
                'company_id' => $companyId,
                'adjustment_date' => $validated['adjustment_date'],
                'reference_number' => $validated['reference_number'] ?? null,
                'adjustment_reason' => $validated['adjustment_reason'],
                'inventory_adjustment_account_id' => $validated['inventory_adjustment_account_id'],
                'memo' => $validated['memo'] ?? null,
            ]);

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
            }
        });

        return redirect()->back()->with('success', 'Inventory quantity adjustment saved successfully.');
    }
}
