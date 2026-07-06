<?php

namespace App\Models;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'company_email',
        'phone',
        'address',
        'website',
        'industry',
        'logo_path',
        'legal_name',
        'tax_id',
        'business_type',
        'legal_address',
        'currency_id',
        'multicurrency',
        'is_onboarded',
        'package_id',
    ];

    protected static function booted()
    {
        static::updated(function ($company) {
            if (session('active_company_id') === $company->id) {
                session()->forget('active_company_data');
            }
            session()->forget('user_companies_data');
        });

        static::deleted(function ($company) {
            if (session('active_company_id') === $company->id) {
                session()->forget('active_company_id');
                session()->forget('active_company_data');
            }
            session()->forget('user_companies_data');
        });
    }
    
    protected $appends = ['logo_url', 'slug', 'home_currency', 'home_currency_prefix'];

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function getHomeCurrencyAttribute()
    {
        $currencies = \Illuminate\Support\Facades\Cache::rememberForever('currencies_all', function () {
            return \App\Models\Currency::all()->keyBy('id');
        });
        return $currencies->get($this->currency_id)?->code;
    }

    public function getHomeCurrencyPrefixAttribute()
    {
        $currencies = \Illuminate\Support\Facades\Cache::rememberForever('currencies_all', function () {
            return \App\Models\Currency::all()->keyBy('id');
        });
        return $currencies->get($this->currency_id)?->symbol;
    }

    public function getLogoUrlAttribute()
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }

    public function getSlugAttribute()
    {
        return Str::slug($this->company_name);
    }

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function suppliers()
    {
        return $this->hasMany(Supplier::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
