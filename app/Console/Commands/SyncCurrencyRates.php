<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Currency;

class SyncCurrencyRates extends Command
{
    protected $signature = 'currency:sync';

    protected $description = 'Sync currency rates from ExchangeRate API';

    public function handle()
    {
        $apiKey = env('EXCHANGE_RATE_API_KEY');
        
        $baseCurrency = Currency::where('is_base_currency', true)->first();
        $baseCode = $baseCurrency ? $baseCurrency->code : 'USD';

        $response = Http::get(
            "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$baseCode}"
        );

        if (!$response->successful()) {
            $this->error('Failed to fetch exchange rates.');
            return;
        }

        $data = $response->json();

        if (($data['result'] ?? null) !== 'success') {
            $this->error('API returned an error.');
            return;
        }

        $rates = $data['conversion_rates'];


        foreach ($rates as $code => $rate) {
        Currency::where('code', $code)
        ->update([
            'exchange_rate' => $rate
        ]);
        }

        Currency::where('code', $baseCode)
            ->update([
                'exchange_rate' => 1
            ]);

        $this->info("Currency rates synchronized successfully relative to base currency ({$baseCode}).");
    }
}