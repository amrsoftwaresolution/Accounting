<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add currency_id as nullable first
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable()->after('legal_address')->constrained('currencies')->restrictOnDelete();
        });

        // 2. Map existing home_currency codes to currency IDs or default to LKR
        $companies = DB::table('companies')->get();
        foreach ($companies as $company) {
            $currencyCode = $company->home_currency ?? 'LKR';
            $currency = DB::table('currencies')->where('code', $currencyCode)->first();
            
            if (!$currency) {
                $symbol = $company->home_currency_prefix ?? 'Rs.';
                $name = $currencyCode === 'LKR' ? 'Sri Lankan Rupee' : ($currencyCode === 'USD' ? 'US Dollar' : $currencyCode);
                $currencyId = DB::table('currencies')->insertGetId([
                    'code' => $currencyCode,
                    'name' => $name,
                    'symbol' => $symbol,
                    'exchange_rate' => $currencyCode === 'LKR' ? 1.0 : ($currencyCode === 'USD' ? 300.0 : 1.0),
                    'is_base_currency' => $currencyCode === 'LKR',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $currencyId = $currency->id;
            }

            DB::table('companies')->where('id', $company->id)->update([
                'currency_id' => $currencyId,
            ]);
        }

        // 3. Make currency_id non-nullable and drop old columns
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable(false)->change();
            $table->dropColumn(['home_currency', 'home_currency_prefix']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Re-add old columns
            $table->string('home_currency')->default('LKR');
            $table->string('home_currency_prefix')->default('Rs.');
        });

        // Restore values from currency relation before dropping the column
        $companies = DB::table('companies')->get();
        foreach ($companies as $company) {
            if ($company->currency_id) {
                $currency = DB::table('currencies')->where('id', $company->currency_id)->first();
                if ($currency) {
                    DB::table('companies')->where('id', $company->id)->update([
                        'home_currency' => $currency->code,
                        'home_currency_prefix' => $currency->symbol,
                    ]);
                }
            }
        }

        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
        });
    }
};
