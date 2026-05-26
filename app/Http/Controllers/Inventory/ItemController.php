<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\ChartOfAcc;
use App\Models\Supplier;
use App\Models\BundleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::with(['category', 'incomeAccount', 'expenseAccount', 'inventoryAccount', 'preferredSupplier', 'bundleComponents.item'])->get();
        $categories = ItemCategory::all();
        $incomeAccounts = ChartOfAcc::where('account_type', 'Income')->get();
        $expenseAccounts = ChartOfAcc::where('account_type', 'Expense')->get();
        $inventoryAccounts = ChartOfAcc::where('account_type', 'asset')->get();
        $suppliers = Supplier::all();
        $allItems = Item::where('type', '!=', 'bundle')->get();

        return Inertia::render('Inventory/ItemList', [
            'items' => $items,
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts,
            'expenseAccounts' => $expenseAccounts,
            'inventoryAccounts' => $inventoryAccounts,
            'suppliers' => $suppliers,
            'allItems' => $allItems,
        ]);
    }

    public function create()
    {
        $categories = ItemCategory::all();
        $incomeAccounts = ChartOfAcc::where('account_type', 'Income')->get();
        $expenseAccounts = ChartOfAcc::where('account_type', 'Expense')->get();
        $inventoryAccounts = ChartOfAcc::where('account_type', 'asset')->get();
        $suppliers = Supplier::all();
        $allItems = Item::where('type', '!=', 'bundle')->get();

        return Inertia::render('Inventory/ItemForm', [
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts,
            'expenseAccounts' => $expenseAccounts,
            'inventoryAccounts' => $inventoryAccounts,
            'suppliers' => $suppliers,
            'allItems' => $allItems,
        ]);
    }

    private function sanitizePrices(Request $request)
    {
        if ($request->has('sale_price')) {
            $request->merge([
                'sale_price' => str_replace(',', '', $request->input('sale_price'))
            ]);
        }
        if ($request->has('purchase_price')) {
            $request->merge([
                'purchase_price' => str_replace(',', '', $request->input('purchase_price'))
            ]);
        }
        if ($request->has('quantity_on_hand')) {
            $request->merge([
                'quantity_on_hand' => str_replace(',', '', $request->input('quantity_on_hand'))
            ]);
        }
        if ($request->has('reorder_point')) {
            $request->merge([
                'reorder_point' => str_replace(',', '', $request->input('reorder_point'))
            ]);
        }
    }

    public function store(Request $request)
    {
        $this->sanitizePrices($request);

        $validated = $request->validate([
            'type' => 'required|string|in:service,inventory,non-inventory,bundle',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'image' => 'nullable',
            'description' => 'nullable|string',
            'sale_price' => 'nullable|numeric|min:0',
            'item_category_id' => 'nullable|exists:item_categories,id',
            'income_account_id' => 'nullable|exists:chart_of_accs,id',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_description' => 'nullable|string',
            'expense_account_id' => 'nullable|exists:chart_of_accs,id',
            'preferred_supplier_id' => 'nullable|exists:suppliers,id',
            'track_inventory' => 'nullable|boolean',
            'quantity_on_hand' => 'nullable|numeric',
            'as_of_date' => 'nullable|date',
            'reorder_point' => 'nullable|numeric|min:0',
            'inventory_account_id' => 'nullable|exists:chart_of_accs,id',
            'is_sold' => 'nullable|boolean',
            'is_purchased' => 'nullable|boolean',
            'bundle_items' => 'nullable|array',
            'bundle_items.*.item_id' => 'required_with:bundle_items|exists:items,id',
            'bundle_items.*.quantity' => 'required_with:bundle_items|numeric|min:0.01',
        ]);

        $companyId = session('active_company_id');
        $validated['company_id'] = $companyId;
        $validated['track_inventory'] = ($request->input('type') === 'inventory');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('items', 'public');
            $validated['image'] = Storage::url($path);
        } else {
            $validated['image'] = $request->input('image');
        }

        // Default toggles based on type if not explicitly set
        if ($validated['type'] === 'inventory') {
            $validated['is_sold'] = true;
            $validated['is_purchased'] = true;
        } else {
            $validated['is_sold'] = $request->boolean('is_sold', true);
            $validated['is_purchased'] = $request->boolean('is_purchased', false);
        }

        $item = Item::create($validated);

        if ($validated['type'] === 'bundle') {
            $bundleItems = $request->input('bundle_items', []);
            foreach ($bundleItems as $bi) {
                BundleItem::create([
                    'bundle_id' => $item->id,
                    'item_id' => $bi['item_id'],
                    'quantity' => $bi['quantity'],
                ]);
            }
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'item' => $item->load(['category', 'incomeAccount', 'expenseAccount', 'inventoryAccount', 'preferredSupplier', 'bundleComponents.item']),
            ]);
        }

        return redirect()->route('items.index')->with('success', 'Item created successfully');
    }

    public function edit(Item $item)
    {
        $item->load('bundleComponents.item');
        $categories = ItemCategory::all();
        $incomeAccounts = ChartOfAcc::where('account_type', 'Income')->get();
        $expenseAccounts = ChartOfAcc::where('account_type', 'Expense')->get();
        $inventoryAccounts = ChartOfAcc::where('account_type', 'asset')->get();
        $suppliers = Supplier::all();
        $allItems = Item::where('type', '!=', 'bundle')->where('id', '!=', $item->id)->get();

        return Inertia::render('Inventory/ItemForm', [
            'item' => $item,
            'categories' => $categories,
            'incomeAccounts' => $incomeAccounts,
            'expenseAccounts' => $expenseAccounts,
            'inventoryAccounts' => $inventoryAccounts,
            'suppliers' => $suppliers,
            'allItems' => $allItems,
        ]);
    }

    public function update(Request $request, Item $item)
    {
        $this->sanitizePrices($request);

        $validated = $request->validate([
            'type' => 'required|string|in:service,inventory,non-inventory,bundle',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'image' => 'nullable',
            'description' => 'nullable|string',
            'sale_price' => 'nullable|numeric|min:0',
            'item_category_id' => 'nullable|exists:item_categories,id',
            'income_account_id' => 'nullable|exists:chart_of_accs,id',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_description' => 'nullable|string',
            'expense_account_id' => 'nullable|exists:chart_of_accs,id',
            'preferred_supplier_id' => 'nullable|exists:suppliers,id',
            'track_inventory' => 'nullable|boolean',
            'quantity_on_hand' => 'nullable|numeric',
            'as_of_date' => 'nullable|date',
            'reorder_point' => 'nullable|numeric|min:0',
            'inventory_account_id' => 'nullable|exists:chart_of_accs,id',
            'is_sold' => 'nullable|boolean',
            'is_purchased' => 'nullable|boolean',
            'bundle_items' => 'nullable|array',
            'bundle_items.*.item_id' => 'required_with:bundle_items|exists:items,id',
            'bundle_items.*.quantity' => 'required_with:bundle_items|numeric|min:0.01',
        ]);

        $validated['track_inventory'] = ($request->input('type') === 'inventory');

        if ($request->hasFile('image')) {
            if ($item->image && str_starts_with($item->image, '/storage/items/')) {
                $oldPath = str_replace('/storage/', '', $item->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('items', 'public');
            $validated['image'] = Storage::url($path);
        } else {
            if ($request->input('image') === null || $request->input('image') === '') {
                if ($item->image && str_starts_with($item->image, '/storage/items/')) {
                    $oldPath = str_replace('/storage/', '', $item->image);
                    Storage::disk('public')->delete($oldPath);
                }
                $validated['image'] = null;
            } else {
                $validated['image'] = $request->input('image');
            }
        }

        if ($validated['type'] === 'inventory') {
            $validated['is_sold'] = true;
            $validated['is_purchased'] = true;
        } else {
            $validated['is_sold'] = $request->boolean('is_sold', true);
            $validated['is_purchased'] = $request->boolean('is_purchased', false);
        }

        $item->update($validated);

        if ($validated['type'] === 'bundle') {
            $item->bundleComponents()->delete();
            $bundleItems = $request->input('bundle_items', []);
            foreach ($bundleItems as $bi) {
                BundleItem::create([
                    'bundle_id' => $item->id,
                    'item_id' => $bi['item_id'],
                    'quantity' => $bi['quantity'],
                ]);
            }
        } else {
            $item->bundleComponents()->delete();
        }

        return redirect()->route('items.index')->with('success', 'Item updated successfully');
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return redirect()->route('items.index')->with('success', 'Item deleted successfully');
    }
}
