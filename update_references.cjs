const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Rename tables
    { from: /\bpayments\b/g, to: 'receive_payments' },
    { from: /\bpayment_allocations\b/g, to: 'receive_payment_allocations' },

    { from: /\bexpenses\b/g, to: 'payments' },
    { from: /\bexpense_items\b/g, to: 'payment_items' },

    { from: /\binvoices\b/g, to: 'credit_invoices' },
    { from: /\binvoice_items\b/g, to: 'credit_invoice_items' },

    { from: /\bsales_receipts\b/g, to: 'sales_invoices' },
    { from: /\bsales_receipt_items\b/g, to: 'sales_invoice_items' },

    { from: /\bcredit_notes\b/g, to: 'invoice_returns' },
    { from: /\bcredit_note_items\b/g, to: 'invoice_return_items' },

    { from: /\bsupplier_credit_notes\b/g, to: 'bill_returns' },
    { from: /\bsupplier_credit_note_items\b/g, to: 'bill_return_items' },

    // 2. Class names and specific variables
    { from: /\bPayment(?=::| |$|;|\\)/g, to: 'ReceivePayment' }, 
    { from: /\bPaymentAllocation(?=::| |$|;|\\)/g, to: 'ReceivePaymentAllocation' },
    { from: /\$payment\b/g, to: '$receivePayment' },
    { from: /\bpayment_id\b/g, to: 'receive_payment_id' },

    { from: /\bExpense(?=::| |$|;|\\)/g, to: 'Payment' }, 
    { from: /\bExpenseItem(?=::| |$|;|\\)/g, to: 'PaymentItem' },
    { from: /\$expense\b/g, to: '$payment' },
    { from: /\bexpense_id\b/g, to: 'payment_id' },

    { from: /\bInvoice(?=::| |$|;|\\)/g, to: 'CreditInvoice' }, 
    { from: /\bInvoiceItem(?=::| |$|;|\\)/g, to: 'CreditInvoiceItem' },
    { from: /\$invoice\b/g, to: '$creditInvoice' },
    { from: /\binvoice_id\b/g, to: 'credit_invoice_id' },
    
    // We already renamed SalesReceipt to SalesInvoice globally in a previous step!
    // But we should rename variables if any exist
    { from: /\$salesReceipt\b/g, to: '$salesInvoice' },
    { from: /\bsales_receipt_id\b/g, to: 'sales_invoice_id' },
    
    // CreditNote was already renamed to InvoiceReturn globally
    // Let's do variables
    { from: /\$creditNote\b/g, to: '$invoiceReturn' },
    { from: /\bcredit_note_id\b/g, to: 'invoice_return_id' },
    
    // SupplierCreditNote
    { from: /\bSupplierCreditNote(?=::| |$|;|\\)/g, to: 'BillReturn' }, 
    { from: /\bSupplierCreditNoteItem(?=::| |$|;|\\)/g, to: 'BillReturnItem' },
    { from: /\$supplierCreditNote\b/g, to: '$billReturn' },
    { from: /\bsupplier_credit_note_id\b/g, to: 'bill_return_id' },

    // String transaction types (optional but good for consistency)
    // "payment" -> "receive_payment"
    { from: /'payment'/g, to: "'receive_payment'" },
    { from: /"payment"/g, to: '"receive_payment"' },

    // "expense" -> "payment"
    { from: /'expense'/g, to: "'payment'" },
    { from: /"expense"/g, to: '"payment"' },
];

function walkSync(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        let filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath, callback);
        } else {
            callback(filepath);
        }
    });
}

const dirs = [
    'c:\\develop\\xampp\\htdocs\\jbooks-garage\\app',
    'c:\\develop\\xampp\\htdocs\\jbooks-garage\\database\\migrations',
    'c:\\develop\\xampp\\htdocs\\jbooks-garage\\resources\\js',
    'c:\\develop\\xampp\\htdocs\\jbooks-garage\\routes',
];

dirs.forEach(dir => {
    walkSync(dir, (filepath) => {
        if (!filepath.endsWith('.php') && !filepath.endsWith('.jsx') && !filepath.endsWith('.js')) return;
        
        let content = fs.readFileSync(filepath, 'utf8');
        let newContent = content;
        replacements.forEach(r => {
            newContent = newContent.replace(r.from, r.to);
        });
        if (content !== newContent) {
            fs.writeFileSync(filepath, newContent, 'utf8');
            console.log('Updated references in: ' + filepath);
        }
    });
});
