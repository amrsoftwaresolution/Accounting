<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportTreeNodeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource['id'] ?? null,
            'name' => $this->resource['name'] ?? null,
            'account_type' => $this->resource['account_type'] ?? null,
            'sub_type' => $this->resource['sub_type'] ?? null,
            'parent_id' => $this->resource['parent_id'] ?? null,
            'balance' => isset($this->resource['balance']) ? (float) $this->resource['balance'] : 0.0,
            'total_balance' => isset($this->resource['total_balance']) ? (float) $this->resource['total_balance'] : 0.0,
            'monthly_balances' => isset($this->resource['monthly_balances']) ? $this->resource['monthly_balances'] : [],
            'total_monthly_balances' => isset($this->resource['total_monthly_balances']) ? $this->resource['total_monthly_balances'] : [],
            'children' => ReportTreeNodeResource::collection($this->resource['children'] ?? []),
        ];
    }
}
