<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HubSyncController extends Controller
{
    // Ensure the Hub is authorized to call this API
    private function verifySecret(Request $request)
    {
        $secret = config('sso.client_secret');
        if ($request->bearerToken() !== $secret || empty($secret)) {
            abort(401, 'Unauthorized or missing secret');
        }
    }

    // Handles the "Fetch" from the Hub
    public function export(Request $request)
    {
        $this->verifySecret($request);

        return response()->json([
            'company' => [
                'id' => 1, // Defaulting to 1 for this local instance
                'name' => config('app.name'),
            ],
            'users' => User::select('name', 'email')->get()
        ]);
    }

    // Handles the "Two-way Sync" when an Admin adds a user in the Hub
    public function importUser(Request $request)
    {
        $this->verifySecret($request);

        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        $user = User::firstOrCreate(
            ['email' => $request->email],
            [
                'name' => $request->name,
                'password' => Hash::make(Str::random(24))
            ]
        );

        // Normally you'd trigger a welcome/invite email here.
        
        return response()->json(['status' => 'User created/synced successfully']);
    }
}
