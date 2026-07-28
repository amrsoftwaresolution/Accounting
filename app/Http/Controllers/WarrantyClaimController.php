<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\WarrantyClaimRequest;
use App\Models\Warranty;
use App\Models\WarrantyClaim;

class WarrantyClaimController extends Controller
{
    public function index()
    {
        return redirect()->route('warranties.index');
    }

    public function store(WarrantyClaimRequest $request, Warranty $warranty)
    {
        $validated = $request->validated();

        WarrantyClaim::create(array_merge($validated, [
            'warranty_id' => $warranty->id,
        ]));

        if ($warranty->status !== 'claimed') {
            $warranty->update(['status' => 'claimed']);
        }

        return redirect()->route('warranties.show', $warranty->id)->with('success', 'Warranty claim logged successfully.');
    }
}
