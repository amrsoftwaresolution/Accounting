<?php
namespace App\Http\Controllers\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    public function index()
{
    $user = Auth::user();

    if ($user->role === 'manager') {
        // ✅ Manager sees only their staff
        $users = User::where('manager_id', $user->id)->get();
    } else {
        // ✅ Admin sees all
        $users = User::with('manager')->get();
    }

    return Inertia::render('Team/Index', [
        'users' => $users,
    ]);
}

public function create()
{
    $managers = User::where('role', 'manager')->get();

    return Inertia::render('Team/Create', [
        'managers' => $managers
    ]);
}


public function store(Request $request)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed',
        'hire_date' => 'nullable|date',
        'manager_id' => [
    'nullable',
    Rule::exists('users', 'id')->where('role', 'manager')
]
    ]);

    $managerId = null;

    if (strtolower(Auth::user()->role) === 'manager') {
        // 🔥 Manager creates staff → assign self
        $managerId = Auth::id();
    } elseif ($request->filled('manager_id')) {
        // 🔥 Admin assigns manager
        $managerId = $request->manager_id;
    }

    User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'staff',
        'hire_date' => $request->hire_date,
        'manager_id' => $managerId,
        'is_active' => $request->boolean('is_active'),
    ]);

    return redirect()->route('team.index');
}

    public function edit(User $team)
{
    $managers = User::where('role', 'manager')->get();

    return Inertia::render('Team/Edit', [
        'user' => $team,
        'managers' => $managers,
    ]);
}

   public function update(Request $request, User $team)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users,email,' . $team->id,
    ]);

    $team->update([
        'name' => $request->name,
        'email' => $request->email,
        'role' => $request->role,
        'hire_date' => $request->hire_date,
        'manager_id' => $request->manager_id,
        'is_active' => $request->is_active ?? false,
    ]);

    return redirect()->route('team.index');
}

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('team.index');
    }
}
