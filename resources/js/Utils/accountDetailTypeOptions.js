export const accountDetailTypeOptions = {
    asset: [
        { value: 'cash-and-cash-equivalents', label: 'Cash and cash equivalents' },
        { value: 'bank', label: 'Bank' },
        { value: 'accounts-receivable', label: 'Accounts receivable (A/R)' },
        { value: 'current-assets', label: 'Current assets' },
        { value: 'fixed-assets', label: 'Fixed assets' },
        { value: 'non-current-assets', label: 'Non-current assets' },
        { value: 'inventory', label: 'Inventory' },
    ],
    liability: [
        { value: 'credit-card', label: 'Credit card' },
        { value: 'accounts-payable', label: 'Accounts payable (A/P)' },
        { value: 'current-liabilities', label: 'Current liabilities' },
        { value: 'non-current-liabilities', label: 'Non-current liabilities' },
    ],
    equity: [
        { value: 'owners-equity', label: "Owner's equity" },
    ],
    income: [
        { value: 'income', label: 'Income' },
        { value: 'other-income', label: 'Other income' },
    ],
    expense: [
        { value: 'payment', label: 'Expense' },
        { value: 'cost-of-goods-sold', label: 'Cost of Goods Sold (COGS)' },
    ],
};

export function getDetailTypeOptions(accountType = 'asset') {
    const normalizedType = String(accountType || '').toLowerCase();
    const typeMap = {
        payment: 'expense',
        expense: 'expense',
    };
    const resolvedType = typeMap[normalizedType] || normalizedType;

    return accountDetailTypeOptions[resolvedType] || accountDetailTypeOptions.asset;
}

export default accountDetailTypeOptions;
