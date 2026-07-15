<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_no }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            @page {
                margin: 0;
                size: A4;
            }
            .no-print {
                display: none !important;
            }
        }
        body {
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 40px;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="max-w-[800px] mx-auto mb-4 flex justify-end no-print">
        <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded shadow">
            Print Invoice
        </button>
    </div>

    <div class="invoice-box">
        <!-- Header -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
            <div class="w-1/2">
                @if($company->logo_url)
                    <img src="{{ $company->logo_url }}" alt="Company Logo" class="max-h-16 mb-4">
                @else
                    <h2 class="text-2xl font-bold text-gray-800 uppercase tracking-wider mb-2">{{ $company->company_name }}</h2>
                @endif
                <div class="text-gray-500 text-sm">
                    {!! nl2br(e($company->address ?? '')) !!}<br>
                    @if($company->company_email) {{ $company->company_email }} <br> @endif
                    @if($company->phone) {{ $company->phone }} @endif
                </div>
            </div>
            <div class="w-1/2 text-right">
                <h1 class="text-4xl font-bold text-gray-900 uppercase tracking-widest mb-4">Invoice</h1>
                <div class="text-sm">
                    <p class="mb-1"><span class="font-semibold text-gray-700">Invoice No:</span> <span class="text-gray-900">#{{ $invoice->invoice_no }}</span></p>
                    <p class="mb-1"><span class="font-semibold text-gray-700">Date:</span> <span class="text-gray-900">{{ \Carbon\Carbon::parse($invoice->invoice_date)->format('M d, Y') }}</span></p>
                    <p class="mb-1"><span class="font-semibold text-gray-700">Due Date:</span> <span class="text-gray-900">{{ \Carbon\Carbon::parse($invoice->due_date)->format('M d, Y') }}</span></p>
                </div>
            </div>
        </div>

        <!-- Bill To -->
        <div class="mb-8">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
            <div class="text-gray-800 font-semibold text-lg">{{ $invoice->customer->display_name ?? $invoice->customer->company_name }}</div>
            <div class="text-gray-600 text-sm mt-1">
                {!! nl2br(e($invoice->billing_address ?? '')) !!}
                @if($invoice->email) <br>{{ $invoice->email }} @endif
            </div>
        </div>

        <!-- Items Table -->
        <table class="w-full text-left border-collapse mb-8">
            <thead>
                <tr class="border-b-2 border-gray-900">
                    <th class="py-3 px-2 font-bold text-gray-900 w-1/2">Description</th>
                    <th class="py-3 px-2 font-bold text-gray-900 text-right w-[15%]">Qty</th>
                    <th class="py-3 px-2 font-bold text-gray-900 text-right w-[15%]">Rate</th>
                    <th class="py-3 px-2 font-bold text-gray-900 text-right w-[20%]">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                <tr class="border-b border-gray-200">
                    <td class="py-4 px-2">
                        <div class="font-semibold text-gray-800">{{ $item->item->name ?? 'Item' }}</div>
                        @if($item->description)
                            <div class="text-sm text-gray-500 mt-1">{{ $item->description }}</div>
                        @endif
                    </td>
                    <td class="py-4 px-2 text-right text-gray-700">{{ $item->quantity }}</td>
                    <td class="py-4 px-2 text-right text-gray-700">{{ $company->home_currency_prefix ?? '$' }}{{ number_format($item->rate, 2) }}</td>
                    <td class="py-4 px-2 text-right text-gray-900 font-semibold">{{ $company->home_currency_prefix ?? '$' }}{{ number_format($item->amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="flex justify-end mb-12">
            <div class="w-1/2 md:w-1/3">
                <div class="flex justify-between py-2 font-bold text-xl border-t-2 border-gray-900 mt-2">
                    <span class="text-gray-900">Total</span>
                    <span class="text-gray-900">{{ $company->home_currency_prefix ?? '$' }}{{ number_format($invoice->total_amount, 2) }}</span>
                </div>
                <div class="flex justify-between py-2 text-gray-600 border-t border-gray-200">
                    <span>Balance Due</span>
                    <span class="font-semibold">{{ $company->home_currency_prefix ?? '$' }}{{ number_format($journalEntry->total_amount - $journalEntry->lines->where('chart_of_acc_id', \App\Models\ChartOfAcc::where('account_code', '1200')->first()?->id)->sum('credit'), 2) }}</span>
                </div>
            </div>
        </div>

        <!-- Notes -->
        @if($invoice->memo || $invoice->statement_message)
        <div class="border-t border-gray-200 pt-6">
            @if($invoice->memo)
            <div class="mb-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Memo</h4>
                <p class="text-sm text-gray-600">{{ $invoice->memo }}</p>
            </div>
            @endif
            @if($invoice->statement_message)
            <div>
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Statement Message</h4>
                <p class="text-sm text-gray-600">{{ $invoice->statement_message }}</p>
            </div>
            @endif
        </div>
        @endif
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        }
    </script>
</body>
</html>
