<?php

namespace App\Http\Controllers;

use App\Mail\UserInvitationMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * List all users
     */
    public function index(): Response
    {
        $activeCompanyId = session('active_company_id');
        $usersQuery = User::with('manager');
        
        if ($activeCompanyId) {
            $usersQuery->whereHas('companies', function($q) use ($activeCompanyId) {
                $q->where('company_id', $activeCompanyId);
            });
        }

        return Inertia::render('Users/Index', [
            'users' => $usersQuery->get(),
        ]);
    }

    /**
     * Show form to create a new user
     */
    public function create(): Response
    {
        $activeCompanyId = session('active_company_id');
        $managersQuery = User::where('role', 'admin');
        
        if ($activeCompanyId) {
            $managersQuery->whereHas('companies', function($q) use ($activeCompanyId) {
                $q->where('company_id', $activeCompanyId);
            });
        }

        return Inertia::render('Users/Create', [
            'managers' => $managersQuery->get(['id', 'name']),
        ]);
    }

    /**
     * Store the new user
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'role' => 'required|in:admin,user',
            'phone' => ['nullable', 'string', 'regex:/^\+94\s?[0-9\s]{9,15}$/', 'max:20'],
        ]);

        $activeCompanyId = session('active_company_id');
        $user = User::where('email', $request->email)->first();

        if ($user) {
            if ($activeCompanyId) {
                if ($user->companies()->where('company_id', $activeCompanyId)->exists()) {
                    return back()->withErrors(['email' => 'This user is already part of this company.']);
                }
                $user->companies()->attach($activeCompanyId, ['role' => $request->role]);
                return redirect()->route('users.index')->with('success', 'Existing user added to this company successfully.');
            }
            return back()->withErrors(['email' => 'The email has already been taken.']);
        }

        $inviteToken = Str::random(64);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'phone' => $request->phone,
            'is_active' => true,
            'invite_token' => $inviteToken,
            'invite_expires_at' => now()->addHours(48),
            'is_invited' => true,
        ]);

        // Link to active company
        if ($activeCompanyId) {
            $user->companies()->attach($activeCompanyId, ['role' => $request->role]);
        }

        $inviteUrl = route('invite.setup', $inviteToken);
        Mail::to($user->email)->send(new UserInvitationMail($user, $inviteUrl));

        return redirect()->route('users.index')->with('success', 'User created and invitation email sent successfully');
    }

    public function resendInvitation(User $user)
    {
        abort_unless(auth()->user()->role === 'admin', 403);

        if (! $user->is_invited) {
            return back()->with('error', 'This user has already completed their invitation.');
        }

        $user->update([
            'invite_token' => Str::random(64),
            'invite_expires_at' => now()->addHours(48),
            'is_invited' => true,
        ]);

        $inviteUrl = route('invite.setup', $user->invite_token);
        Mail::to($user->email)->send(new UserInvitationMail($user, $inviteUrl));

        return back()->with('success', 'Invitation resent successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'userToEdit' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|in:admin,user',
            'phone' => ['nullable', 'string', 'regex:/^\+94\s?[0-9\s]{9,15}$/', 'max:20'],
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'phone' => $request->phone,
        ]);

        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    /**
     * Delete a user
     */
    public function destroy(User $user)
    {
        // Prevent users from deleting themselves
        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}
