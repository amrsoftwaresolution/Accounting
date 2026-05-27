<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function showSetupForm(string $token)
    {
        $user = User::where('invite_token', $token)
            ->where('is_invited', true)
            ->first();

        if (! $user || ($user->invite_expires_at && $user->invite_expires_at->isPast())) {
            return redirect()->route('login')->with('error', 'This invitation link is invalid or has expired.');
        }

        return Inertia::render('Auth/Invite', [
            'token' => $token,
            'email' => $user->email,
            'appName' => config('app.name'),
        ]);
    }

    public function storePassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|confirmed|min:8',
        ]);

        $user = User::where('invite_token', $request->token)
            ->where('is_invited', true)
            ->first();

        if (! $user) {
            return redirect()->route('login')->with('error', 'Unable to find an invitation for this link.');
        }

        if ($user->invite_expires_at && $user->invite_expires_at->isPast()) {
            return redirect()->route('login')->with('error', 'Your invitation link has expired. Please ask your administrator to resend the invitation.');
        }

        $user->password = Hash::make($request->password);
        $user->invite_token = null;
        $user->invite_expires_at = null;
        $user->is_invited = false;
        $user->email_verified_at = now();
        $user->save();

        return redirect()->route('login')->with('success', 'Your account has been activated. Please log in with your new password.');
    }
}
