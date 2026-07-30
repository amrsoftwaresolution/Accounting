<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;

class SupplierBalanceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->display_name ?? $this->resource->company_name,
            'email' => $this->resource->email,
            'phone' => $this->resource->phone_number,
            'balance' => (float) $this->resource->balance,
        ];
    }
}
