<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Services\Reports\AccountTreeBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfitAndLossController extends Controller
{
    protected $treeBuilder;

    public function __construct(AccountTreeBuilder $treeBuilder)
    {
        $this->treeBuilder = $treeBuilder;
    }

    public function profitAndLoss(Request $request)
    {
        $displayBy = $request->get('display_by', 'total');
        $start = $request->get('start_date');
        $end = $request->get('end_date');

        $lines = collect(DB::select(
            'select journal_entry_lines.chart_of_acc_id, sum(journal_entry_lines.debit) as total_debit, sum(journal_entry_lines.credit) as total_credit from journal_entry_lines join journal_entries on journal_entry_lines.journal_entry_id = journal_entries.id where journal_entries.created_at between ? and ? group by journal_entry_lines.chart_of_acc_id',
            [$start, $end]
        ));

        $types = ['Income', 'Expense'];

        $months = [];
        if ($displayBy === 'month') {
            $period = new \DateTime($start);
            $endDt = new \DateTime($end);
            while ($period <= $endDt) {
                $months[] = $period->format('Y-m');
                $period->modify('+1 month');
            }
        }

        $tree = $this->treeBuilder->buildPnLTree($types, $lines, $displayBy, $months);

        return Inertia::render('Reports/ProfitAndLoss', [
            'reportData' => $tree,
            'filters' => [
                'start_date' => $start,
                'end_date' => $end,
                'display_by' => $displayBy,
                'months' => $months,
                'type' => $request->get('type'),
            ],
        ]);
    }
}
