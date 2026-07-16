<?php
$controllers = [
    'InvoiceController.php',
    'BillController.php',
    'SupplierCreditController.php',
    'ReceivePaymentController.php',
    'PayBillController.php',
    'CreditNoteController.php',
    'ChequeController.php',
    'SalesReceiptController.php',
];

foreach ($controllers as $controller) {
    $path = "c:/develop/xampp/htdocs/jobalign-books/app/Http/Controllers/Accounting/" . $controller;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        
        $search = <<<'EOD'
            'staticFooterContent' => $printSetting?->static_footer_content ?: null,
            'layoutConfig' => $printSetting?->layout_config,
EOD;

        $replace = <<<'EOD'
            'staticFooterContent' => $printSetting?->static_footer_content ?: null,
            'layoutConfig' => $printSetting?->layout_config,
            'primaryColor' => $printSetting?->primary_color,
            'textColor' => $printSetting?->text_color,
            'pageSetup' => $printSetting?->page_setup,
            'blockStyles' => $printSetting?->block_styles,
EOD;

        if (strpos($content, $replace) === false) {
            $content = str_replace($search, $replace, $content);
            file_put_contents($path, $content);
            echo "Updated $controller\n";
        } else {
            echo "Already updated $controller\n";
        }
    }
}
