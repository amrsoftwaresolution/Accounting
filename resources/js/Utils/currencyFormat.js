export function formatCurrency(value, currency = 'LKR') {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) {
        return `${currency} 0`;
    }
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default formatCurrency;
