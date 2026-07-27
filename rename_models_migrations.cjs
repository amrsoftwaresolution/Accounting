const fs = require('fs');
const path = require('path');

const migrationsDir = 'c:\\develop\\xampp\\htdocs\\jbooks-garage\\database\\migrations';
const modelsDir = 'c:\\develop\\xampp\\htdocs\\jbooks-garage\\app\\Models';

const renameMap = [
    // Models
    { oldFile: 'Payment.php', newFile: 'ReceivePayment.php', oldTable: 'payments', newTable: 'receive_payments' },
    { oldFile: 'PaymentAllocation.php', newFile: 'ReceivePaymentAllocation.php', oldTable: 'payment_allocations', newTable: 'receive_payment_allocations' },
    { oldFile: 'Expense.php', newFile: 'Payment.php', oldTable: 'expenses', newTable: 'payments' },
    { oldFile: 'ExpenseItem.php', newFile: 'PaymentItem.php', oldTable: 'expense_items', newTable: 'payment_items' },
    { oldFile: 'Invoice.php', newFile: 'CreditInvoice.php', oldTable: 'invoices', newTable: 'credit_invoices' },
    { oldFile: 'InvoiceItem.php', newFile: 'CreditInvoiceItem.php', oldTable: 'invoice_items', newTable: 'credit_invoice_items' },
    { oldFile: 'SalesReceipt.php', newFile: 'SalesInvoice.php', oldTable: 'sales_receipts', newTable: 'sales_invoices' },
    { oldFile: 'SalesReceiptItem.php', newFile: 'SalesInvoiceItem.php', oldTable: 'sales_receipt_items', newTable: 'sales_invoice_items' },
    { oldFile: 'CreditNote.php', newFile: 'InvoiceReturn.php', oldTable: 'credit_notes', newTable: 'invoice_returns' },
    { oldFile: 'CreditNoteItem.php', newFile: 'InvoiceReturnItem.php', oldTable: 'credit_note_items', newTable: 'invoice_return_items' },
    { oldFile: 'SupplierCreditNote.php', newFile: 'BillReturn.php', oldTable: 'supplier_credit_notes', newTable: 'bill_returns' },
    { oldFile: 'SupplierCreditNoteItem.php', newFile: 'BillReturnItem.php', oldTable: 'supplier_credit_note_items', newTable: 'bill_return_items' }
];

// First, rename the migrations
const migrationFiles = fs.readdirSync(migrationsDir);

renameMap.forEach(map => {
    // Find the migration file for the old table
    // It usually looks like `YYYY_MM_DD_HHMMSS_create_tablename_table.php`
    const oldMigrationSnippet = `_create_${map.oldTable}_table.php`;
    const newMigrationSnippet = `_create_${map.newTable}_table.php`;
    
    const migrationFile = migrationFiles.find(f => f.endsWith(oldMigrationSnippet));
    if (migrationFile) {
        const oldPath = path.join(migrationsDir, migrationFile);
        const newPath = path.join(migrationsDir, migrationFile.replace(oldMigrationSnippet, newMigrationSnippet));
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed migration: ${migrationFile} -> ${path.basename(newPath)}`);
    } else {
        console.log(`Could not find migration for table ${map.oldTable}`);
    }
});

// Rename models
renameMap.forEach(map => {
    const oldPath = path.join(modelsDir, map.oldFile);
    const newPath = path.join(modelsDir, map.newFile);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed model: ${map.oldFile} -> ${map.newFile}`);
    } else {
        console.log(`Could not find model ${map.oldFile}`);
    }
});

