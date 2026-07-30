<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentMethodController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean'
        ]);

        $name = $validated['name'];
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $i = 1;
        while (PaymentMethod::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i++;
        }

        $paymentMethod = PaymentMethod::create([
            'name' => $name,
            'slug' => $slug,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if ($request->wantsJson() || $request->header('X-Inertia')) {
            return redirect()->back()->with('new_payment_method', [
                'value' => $paymentMethod->id,
                'label' => $paymentMethod->name
            ]);
        }

        return redirect()->back()->with('success', 'Payment method created successfully.');
    }
}
