<?php

namespace App\Http\Resources\Reports;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class PurchaseByItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'item' => [
                'id' => $this->resource['item']['id'],
                'name' => $this->resource['item']['name'],
                'sku' => $this->resource['item']['sku'],
                'total_qty' => (float) $this->resource['item']['total_qty'],
                'total_amount' => (float) $this->resource['item']['total_amount'],
            ],
            'lines' => collect($this->resource['lines'])->map(function ($line) {
                return [
                    'id' => $line['id'],
                    'journal_entry_id' => $line['journal_entry_id'],
                    'date' => isset($line['date']) ? Carbon::parse($line['date'])->toIso8601String() : null,
                    'transaction_type' => $line['transaction_type'],
                    'reference' => $line['reference'],
                    'contact_name' => $line['contact_name'],
                    'qty' => (float) $line['qty'],
                    'rate' => (float) $line['rate'],
                    'amount' => (float) $line['amount'],
                ];
            })->values(),
        ];
    }
}
