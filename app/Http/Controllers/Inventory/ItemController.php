<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\ChartOfAcc;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::with(['category', 'incomeAccount'])->get();
        $categories = ItemCategory::all();
        $incomeAccounts = ChartOfAcc::where('account_type', 'Income')->get();

        return Inertia::render('Inventory/ItemList', [
            'items' => $items,
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts,
        ]);
    }

    public function create()
    {
        $categories = ItemCategory::all();
        $incomeAccounts = ChartOfAcc::where('account_type', 'Income')->get();

        return Inertia::render('Inventory/ItemForm', [
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'sale_price' => 'required|numeric|min:0',
            'item_category_id' => 'nullable|exists:item_categories,id',
            'income_account_id' => 'nullable|exists:chart_of_accs,id',
        ]);

        $item = Item::create($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'item' => $item,
            ]);
        }

        return redirect()->route('items.index')->with('success', 'Item created successfully');
    }

    public function edit(Item $item)
    {
        $categories = ItemCategory::all();
        $incomeAccounts = ChartOfAcc::where('account_type', 'Income')->get();

        return Inertia::render('Inventory/ItemForm', [
            'item' => $item,
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts
        ]);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
            'sale_price' => 'required|numeric|min:0',
            'item_category_id' => 'nullable|exists:item_categories,id',
            'income_account_id' => 'nullable|exists:chart_of_accs,id',
        ]);

        $item->update($validated);

        return redirect()->route('items.index')->with('success', 'Item updated successfully');
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return redirect()->route('items.index')->with('success', 'Item deleted successfully');
    }
}
