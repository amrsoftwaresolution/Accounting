<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Tenant;
use App\Models\Company;

class User extends Authenticatable
{
    use HasFactory, Notifiable, \Illuminate\Database\Eloquent\Concerns\HasUuids;

    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     *
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'is_active',
        'hire_date',
        'manager_id',
        'invite_token',
        'invite_expires_at',
        'is_invited',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'invite_expires_at' => 'datetime',
        'is_invited' => 'boolean',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function employees()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function companies()
    {
        return $this->belongsToMany(Company::class)->withPivot('role')->withTimestamps();
    }

    public function getCachedCompaniesAttribute()
    {
        $sessionCompanies = session('user_companies_data');
        if ($sessionCompanies) {
            return $sessionCompanies;
        }

        $companies = $this->companies()->get();
        session(['user_companies_data' => $companies]);
        return $companies;
    }

    public function currentCompany()
    {
        $companyId = session('active_company_id');
        if (!$companyId) {
            return null;
        }

        $sessionCompany = session('active_company_data');
        if ($sessionCompany && $sessionCompany->id === $companyId) {
            return $sessionCompany;
        }

        $company = Company::find($companyId);
        if ($company) {
            session(['active_company_data' => $company]);
        }
        return $company;
    }
}
