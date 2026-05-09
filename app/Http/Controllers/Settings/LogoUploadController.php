<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LogoUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $companyId = session('active_company_id');
        if (!$companyId) {
            return back()->withErrors(['logo' => 'No active company found.']);
        }

        $company = \App\Models\Company::findOrFail($companyId);

        if ($request->hasFile('logo')) {
            // Delete old logo if it exists
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            // Store new logo in 'logos' folder within public disk
            $path = $request->file('logo')->store('logos', 'public');

            $company->logo_path = $path;
            $company->save();
        }

        return back()->with('message', 'Logo updated successfully!');
    }
}
