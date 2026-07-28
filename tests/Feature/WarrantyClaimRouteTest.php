<?php

namespace Tests\Feature;

use Illuminate\Support\Str;
use Tests\TestCase;

class WarrantyClaimRouteTest extends TestCase
{
    public function test_store_route_includes_warranty_parameter(): void
    {
        $warrantyId = (string) Str::uuid();

        $url = route('warranty-claims.store', ['warranty' => $warrantyId]);

        $this->assertStringContainsString('/warranty-claims/' . $warrantyId, $url);
    }
}
