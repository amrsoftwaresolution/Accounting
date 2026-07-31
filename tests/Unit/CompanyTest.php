<?php

namespace Tests\Unit;

use App\Models\Company;
use PHPUnit\Framework\TestCase;

class CompanyTest extends TestCase
{
    public function test_home_currency_prefix_returns_null_when_not_configured(): void
    {
        $company = new Company();

        $this->assertNull($company->home_currency_prefix);
    }
}
