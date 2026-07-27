export const getEditRoute = (type) => {
    switch (type) {
        case 'pos': return 'pos.edit';
        case 'sales_invoice': return 'sales-invoice.edit';
        case 'credit_invoice': return 'credit-invoice.edit';
        case 'receive_payment': return 'receive-payment.edit';

        case 'payment': return 'payment.edit';
        case 'bill': return 'bill.edit';
        case 'pay_bill': return 'pay-bill.edit';
        case 'bill_return': return 'bill-return.edit';
        case 'cheque': return 'cheque.edit';

        case 'bank_deposit': return 'bank-deposit.edit';
        case 'transfer': return 'transfer.edit';
        default: return 'journal-entries.edit';
    }
};
