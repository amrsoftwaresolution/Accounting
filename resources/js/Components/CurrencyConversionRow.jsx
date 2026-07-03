import CommonInput from "@/Components/CommonInput";

export default function CurrencyConversionRow({
    details,
    exchangeRate,
    onExchangeRateChange,
    error
}) {
    if (!details?.is_multi_currency) {
        return null;
    }

    const formattedExchangeRate = (() => {
        if (exchangeRate === undefined || exchangeRate === null || exchangeRate === '') {
            return exchangeRate ?? '';
        }

        const numericValue = Number(String(exchangeRate).replace(/,/g, ''));
        return Number.isFinite(numericValue) ? numericValue.toFixed(2) : exchangeRate;
    })();

    return (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-700">
                1 {details.currency_code} {details.flag}
            </span>
            <span className="text-sm text-slate-500">=</span>
            <div className="w-[180px]">
                <CommonInput
                    type="text"
                    label=""
                    value={formattedExchangeRate}
                    onChange={(e) => onExchangeRateChange(e.target.value)}
                    size="sm"
                    inputClass="text-right"
                    className="border-slate-300"
                    error={error}
                />
            </div>
            <span className="text-sm font-semibold text-slate-700">LKR 🇱🇰</span>
        </div>
    );
}
