<?php

namespace App\Services;

use App\Models\Currency;
use App\Models\Company;

class CurrencyConversionService
{
    /**
     * Convert an amount from one currency to another using stored exchange rates.
     * Accepts either a Currency model or a string currency code (e.g. 'USD').
     *
     * @param float $amount
     * @param Currency|string $from
     * @param Currency|string $to
     * @return float
     */
    public function convert(float $amount, $from, $to): float
    {
        // Resolve $from currency
        if (is_string($from)) {
            $from = Currency::where('code', $from)->first();
        }
        
        // Resolve $to currency
        if (is_string($to)) {
            $to = Currency::where('code', $to)->first();
        }

        // If either currency could not be resolved, find system base currency as fallback
        if (!$from) {
            $from = Currency::where('is_base_currency', true)->first();
        }
        if (!$to) {
            $to = Currency::where('is_base_currency', true)->first();
        }

        // If still unresolved or identical, return original amount
        if (!$from || !$to || $from->id === $to->id) {
            return $amount;
        }

        // Convert amount to base currency first (divide by from_rate)
        $amountInBase = $amount / max($from->exchange_rate, 0.000001);

        // Convert from base currency to target currency (multiply by to_rate)
        $convertedAmount = $amountInBase * $to->exchange_rate;

        return round($convertedAmount, 2);
    }

    /**
     * Convert an amount to a company's home currency.
     *
     * @param float $amount
     * @param Currency|string $from
     * @param Company $company
     * @return float
     */
    public function convertToHome(float $amount, $from, Company $company): float
    {
        $company->loadMissing('currency');
        
        if (!$company->currency) {
            // Fallback if company has no currency assigned
            $baseCurrency = Currency::where('is_base_currency', true)->first();
            if (!$baseCurrency) {
                return $amount;
            }
            return $this->convert($amount, $from, $baseCurrency);
        }

        return $this->convert($amount, $from, $company->currency);
    }
}
