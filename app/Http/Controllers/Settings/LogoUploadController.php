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

        $settings = CompanySetting::first() ?? new CompanySetting();

        if ($request->hasFile('logo')) {
            // Delete old logo if it exists
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            // Store new logo in 'logos' folder within public disk
            $path = $request->file('logo')->store('logos', 'public');

            $settings->logo_path = $path;
            $settings->save();
        }

        return back()->with('message', 'Logo updated successfully!');
    }
}
