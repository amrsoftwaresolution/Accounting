const fs = require('fs');
const path = require('path');

const requestsDir = 'c:\\develop\\xampp\\htdocs\\jbooks-garage\\app\\Http\\Requests\\Accounting';
const controllersDir = 'c:\\develop\\xampp\\htdocs\\jbooks-garage\\app\\Http\\Controllers\\Accounting';

const map = {
    'BankDeposit': 'BankDeposit',
    'Bill': 'Bill',
    'ChartOfAcc': 'ChartOfAcc',
    'Cheque': 'Cheque',
    'CreditNote': 'InvoiceReturn',
    'Expense': 'Payment',
    'Invoice': 'CreditInvoice',
    'JournalEntry': 'JournalEntry',
    'ReceivePayment': 'ReceivePayment',
    'SalesReceipt': 'SalesInvoice',
    'SupplierCredit': 'BillReturn',
    'Transfer': 'Transfer'
};

for (const [oldName, newName] of Object.entries(map)) {
    const storeReq = path.join(requestsDir, `Store${oldName}Request.php`);
    const updateReq = path.join(requestsDir, `Update${oldName}Request.php`);
    const combinedReq = path.join(requestsDir, `${newName}Request.php`);

    // 1. Rename Store request to the Combined request
    if (fs.existsSync(storeReq)) {
        let content = fs.readFileSync(storeReq, 'utf8');
        content = content.replace(`class Store${oldName}Request`, `class ${newName}Request`);
        fs.writeFileSync(combinedReq, content);
        fs.unlinkSync(storeReq);
        console.log(`Created ${newName}Request.php from Store${oldName}Request.php`);
    } else {
        // Maybe it's already renamed?
        console.log(`Could not find ${storeReq}`);
    }

    // 2. Delete Update request
    if (fs.existsSync(updateReq)) {
        fs.unlinkSync(updateReq);
        console.log(`Deleted ${updateReq}`);
    }

    // 3. Update Controller to use combined request
    // Controller name might be NewNameController.php
    let controllerPath = path.join(controllersDir, `${newName}Controller.php`);
    if (!fs.existsSync(controllerPath)) {
        // Some controllers might not match exactly, let's try OldNameController
        controllerPath = path.join(controllersDir, `${oldName}Controller.php`);
        if (!fs.existsSync(controllerPath)) {
             // Let's just find any controller that uses this request
             const files = fs.readdirSync(controllersDir);
             for(const file of files) {
                 const fullPath = path.join(controllersDir, file);
                 const c = fs.readFileSync(fullPath, 'utf8');
                 if (c.includes(`Store${oldName}Request`)) {
                     controllerPath = fullPath;
                     break;
                 }
             }
        }
    }

    if (fs.existsSync(controllerPath)) {
        let content = fs.readFileSync(controllerPath, 'utf8');
        // Replace imports
        content = content.replace(new RegExp(`use App\\\\Http\\\\Requests\\\\Accounting\\\\Store${oldName}Request;`, 'g'), `use App\\Http\\Requests\\Accounting\\${newName}Request;`);
        content = content.replace(new RegExp(`use App\\\\Http\\\\Requests\\\\Accounting\\\\Update${oldName}Request;\\r?\\n`, 'g'), '');
        
        // Replace method signatures
        content = content.replace(new RegExp(`Store${oldName}Request`, 'g'), `${newName}Request`);
        content = content.replace(new RegExp(`Update${oldName}Request`, 'g'), `${newName}Request`);
        
        fs.writeFileSync(controllerPath, content);
        console.log(`Updated references in ${path.basename(controllerPath)}`);
    }
}
