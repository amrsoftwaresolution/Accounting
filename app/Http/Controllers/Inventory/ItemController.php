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
    public function index(Request $request)
    {
        $companyId = session('active_company_id');
        $query = Item::with(['category', 'incomeAccount', 'expenseAccount', 'inventoryAccount', 'preferredSupplier', 'bundleComponents.item'])
            ->where('items.company_id', $companyId);

        // Calculate counts before pagination
        $lowStockCount = (clone $query)->where('track_inventory', true)
            ->whereNotNull('reorder_point')
            ->whereRaw('quantity_on_hand <= reorder_point')
            ->where('quantity_on_hand', '>', 0)
            ->count();
            
        $outOfStockCount = (clone $query)->where('track_inventory', true)
            ->where('quantity_on_hand', '<=', 0)
            ->count();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'low') {
                $query->where('track_inventory', true)
                    ->whereNotNull('reorder_point')
                    ->whereRaw('quantity_on_hand <= reorder_point')
                    ->where('quantity_on_hand', '>', 0);
            } else if ($request->stock_status === 'out') {
                $query->where('track_inventory', true)
                    ->where('quantity_on_hand', '<=', 0);
            }
        }

        // To group by category, we order by category name then item name
        $query->leftJoin('item_categories', 'items.item_category_id', '=', 'item_categories.id')
            ->orderBy('item_categories.name', 'asc')
            ->orderBy('items.name', 'asc')
            ->select('items.*');

        $items = $query->paginate(20)->withQueryString();

        return Inertia::render('Inventory/ItemList', [
            'items' => $items,
            'filters' => request()->all('search', 'type', 'stock_status'),
            'counts' => [
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventory/ItemForm');
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

        return Inertia::render('Inventory/ItemForm', [
            'item' => $item,
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
