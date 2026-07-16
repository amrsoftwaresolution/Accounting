<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintSetting extends Model
{
    protected $fillable = [
        'company_id',
        'document_type',
        'custom_title',
        'header_alignment',
        'static_footer_content',
        'layout_config',
        'primary_color',
        'text_color',
        'page_setup',
        'block_styles',
    ];

    protected $casts = [
        'layout_config' => 'array',
        'page_setup' => 'array',
        'block_styles' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
