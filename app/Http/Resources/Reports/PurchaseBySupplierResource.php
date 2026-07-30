<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseBySupplierResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'supplier_id' => $this->resource->supplier_id,
            'supplier_name' => $this->resource->supplier_name,
            'tx_count' => (int) $this->resource->tx_count,
            'total_amount' => (float) $this->resource->total_amount,
        ];
    }
}
