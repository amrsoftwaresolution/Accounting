<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;

use Illuminate\Support\Arr;

class ProfitAndLossResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'income' => ReportTreeNodeResource::collection(collect(data_get($this->resource, 'reportData.income', []))),
            'expense' => ReportTreeNodeResource::collection(collect(data_get($this->resource, 'reportData.expense', []))),
            'cogs' => ReportTreeNodeResource::collection(collect(data_get($this->resource, 'reportData.cogs', []))),
            'filters' => [
                'display_by' => data_get($this->resource, 'filters.display_by'),
                'start_date' => data_get($this->resource, 'filters.start_date'),
                'end_date' => data_get($this->resource, 'filters.end_date'),
                'months' => data_get($this->resource, 'filters.months', []),
            ],
        ];
    }
}
