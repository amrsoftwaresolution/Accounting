<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$req = Illuminate\Http\Request::create('/api/history/sales_invoice', 'GET', ['limit' => 5]);
$ctrl = new App\Http\Controllers\Api\TransactionHistoryController();
$res = $ctrl->index($req, 'sales_invoice');
echo json_encode($res->getData());
