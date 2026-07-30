<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;

class InventorySummaryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'sku' => $this->resource->sku,
            'qty_on_hand' => isset($this->resource->qty_on_hand) ? (float) $this->resource->qty_on_hand : 0.0,
            'avg_cost' => isset($this->resource->avg_cost) ? (float) $this->resource->avg_cost : 0.0,
            'asset_value' => isset($this->resource->asset_value) ? (float) $this->resource->asset_value : 0.0,
        ];
    }
}
