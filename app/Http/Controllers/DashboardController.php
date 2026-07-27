<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ChartOfAcc;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
                $today = Carbon::today();
        
        // Service Center Metrics
        $todaysJobs = \App\Models\JobCard::query()
            ->whereDate('service_date', $today)
            ->count();
            
        $pendingJobs = \App\Models\JobCard::query()
            ->whereNotIn('status', ['Ready', 'Delivered', 'Cancelled'])
            ->count();
            
        // Financial Metrics (simplified for Service Center)
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $todaysRevenue = JournalEntryLine::whereHas('account', function($q) {
                $q->whereIn('account_type', ['income', 'other_income']);
            })
            ->whereHas('journalEntry', function($q) use ($today) {
                $q
                  ->whereDate('date', $today);
            })
            ->sum(DB::raw('credit - debit'));

        $monthlyRevenue = JournalEntryLine::whereHas('account', function($q) {
                $q->whereIn('account_type', ['income', 'other_income']);
            })
            ->whereHas('journalEntry', function($q) use ($currentMonth, $currentYear) {
                $q
                  ->whereYear('date', $currentYear)
                  ->whereMonth('date', $currentMonth);
            })
            ->sum(DB::raw('credit - debit'));

        $monthlyExpenses = JournalEntryLine::whereHas('account', function($q) {
                $q->whereIn('account_type', ['payment', 'cost_of_goods_sold']);
            })
            ->whereHas('journalEntry', function($q) use ($currentMonth, $currentYear) {
                $q
                  ->whereYear('date', $currentYear)
                  ->whereMonth('date', $currentMonth);
            })
            ->sum(DB::raw('debit - credit'));

        $monthlyProfit = $monthlyRevenue - $monthlyExpenses;

        // Inventory Alerts (Items where qty < some threshold, say 5)
        $lowStockItems = \App\Models\Item::query()
            ->where('type', 'inventory')
            ->where('quantity_on_hand', '<=', 5)
            ->take(5)
            ->get(['id', 'name', 'quantity_on_hand']);

        // Recent Jobs
        $recentJobs = \App\Models\JobCard::with(['customer', 'device'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'todays_jobs' => $todaysJobs,
                'pending_jobs' => $pendingJobs,
                'todays_revenue' => $todaysRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'monthly_expenses' => $monthlyExpenses,
                'monthly_profit' => $monthlyProfit,
            ],
            'lowStockItems' => $lowStockItems,
            'recentJobs' => $recentJobs
        ]);
    }
}
