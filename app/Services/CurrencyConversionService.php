<?php

namespace App\Services;

class CurrencyConversionService
{
    /**
     * Stubbed: Return original amount directly as currency is fixed to Rs.
     */
    public function convert($amount, $from, $to)
    {
        return $amount;
    }

    /**
     * Stubbed: Return original amount.
     */
    public function convertToHomeCurrency($amount, $from, $company)
    {
        return $amount;
    }
}
