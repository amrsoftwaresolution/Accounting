<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesByCustomerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'customer_name' => $this->resource->customer_name,
            'invoice_count' => (int) $this->resource->invoice_count,
            'total_amount' => (float) $this->resource->total_amount,
        ];
    }
}
