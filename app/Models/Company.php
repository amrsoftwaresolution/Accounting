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
        'home_currency',
        'home_currency_prefix',
        'multicurrency',
        'is_onboarded',
    ];
    
    protected $appends = ['logo_url', 'slug'];

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
}
