<?php

$filePath = __DIR__ . '/database/u487520070_jobalign_book.sql';
if (!file_exists($filePath)) {
    echo "File not found: {$filePath}\n";
    exit(1);
}

$outDir = __DIR__ . '/database/separated_dumps';
if (!is_dir($outDir)) {
    mkdir($outDir, 0755, true);
}

echo "Parsing: {$filePath}\n";

$pdo = new PDO('mysql:host=127.0.0.1;dbname=steel_audit', 'root', '');
$validTableColumns = [];

$handle = fopen($filePath, 'r');

$companyHandles = [];
$sharedHandle = fopen($outDir . '/shared.sql', 'w');

$getCompanyHandle = function ($companyId) use (&$companyHandles, $outDir) {
    if (!isset($companyHandles[$companyId])) {
        $companyHandles[$companyId] = fopen($outDir . "/company_{$companyId}.sql", 'w');
        fwrite($companyHandles[$companyId], "-- Company {$companyId} Dump\n");
        fwrite($companyHandles[$companyId], "SET FOREIGN_KEY_CHECKS=0;\nSET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\nSTART TRANSACTION;\nSET time_zone = \"+00:00\";\n\n");
    }
    return $companyHandles[$companyId];
};

function splitSqlValues($string) {
    $values = [];
    $current = '';
    $inString = false;
    $escape = false;
    $len = strlen($string);
    for ($i = 0; $i < $len; $i++) {
        $char = $string[$i];
        if ($escape) {
            $current .= $char;
            $escape = false;
        } elseif ($char === '\\') {
            $current .= $char;
            $escape = true;
        } elseif ($char === "'") {
            $current .= $char;
            $inString = !$inString;
        } elseif ($char === ',' && !$inString) {
            $values[] = trim($current);
            $current = '';
        } else {
            $current .= $char;
        }
    }
    $values[] = trim($current);
    return $values;
}

$currentTable = null;
$companyIdIndex = -1;
$transactionTypeIndex = -1;
$indicesToRemove = [];
$isInsertBlock = false;
$insertHeader = '';
$alwaysStrip = ['company_id'];

while (($line = fgets($handle)) !== false) {
    if (preg_match('/^INSERT INTO `([^`]+)` \((.*?)\) VALUES/i', $line, $matches)) {
        $currentTable = $matches[1];
        $columnsString = $matches[2];
        preg_match_all('/`([^`]+)`/', $columnsString, $colMatches);
        $columns = $colMatches[1];
        
        if (!isset($validTableColumns[$currentTable])) {
            try {
                $stmt = $pdo->query("SHOW COLUMNS FROM `$currentTable`");
                if ($stmt) {
                    $validTableColumns[$currentTable] = $stmt->fetchAll(PDO::FETCH_COLUMN);
                } else {
                    // If table doesn't exist, treat it as having 0 valid columns to skip it
                    $validTableColumns[$currentTable] = [];
                }
            } catch (Exception $e) {
                // Exception usually means table doesn't exist in PDO
                $validTableColumns[$currentTable] = [];
            }
        }
        
        $validCols = $validTableColumns[$currentTable];
        
        $companyIdIndex = array_search('company_id', $columns);
        $transactionTypeIndex = array_search('transaction_type', $columns);
        
        $indicesToRemove = [];
        foreach ($columns as $idx => $col) {
            if (in_array($col, $alwaysStrip) || !in_array($col, $validCols)) {
                $indicesToRemove[] = $idx;
                unset($columns[$idx]);
            }
        }
        
        if (!empty($indicesToRemove)) {
            if (empty($columns)) {
                $isInsertBlock = true;
                $insertHeader = "";
                continue;
            }
            $newColumnsString = implode(', ', array_map(function($c) { return "`$c`"; }, $columns));
            $insertHeader = "INSERT INTO `$currentTable` ($newColumnsString) VALUES";
        } else {
            $insertHeader = rtrim($line, "\r\n");
            if ($companyIdIndex === false) {
                fwrite($sharedHandle, $line);
            }
        }
        
        $isInsertBlock = true;
        continue;
    }

    if ($isInsertBlock) {
        $trimmed = trim($line);
        if ($trimmed === '' || $trimmed[0] !== '(') {
            $isInsertBlock = false;
            $currentTable = null;
            if ($insertHeader !== "") {
                fwrite($sharedHandle, $line);
            }
        } else {
            if ($insertHeader === "") continue;
            
            if ($companyIdIndex !== false || !empty($indicesToRemove)) {
                preg_match('/^\((.*)\)[,;]$/', $trimmed, $valMatches);
                if (!empty($valMatches)) {
                    $rawValuesString = $valMatches[1];
                    $values = splitSqlValues($rawValuesString);
                    
                    $companyId = ($companyIdIndex !== false && isset($values[$companyIdIndex])) ? trim($values[$companyIdIndex], " '\"") : null;

                    if ($companyIdIndex !== false && is_numeric($companyId)) {
                        if ($transactionTypeIndex !== false && isset($values[$transactionTypeIndex])) {
                            if (trim($values[$transactionTypeIndex], " '\"") === 'invoice') {
                                $values[$transactionTypeIndex] = "'credit_invoice'";
                            }
                        }
                        
                        foreach ($indicesToRemove as $idx) {
                            unset($values[$idx]);
                        }
                        
                        $newLine = "(" . implode(', ', $values) . ");\n";
                        
                        $cHandle = $getCompanyHandle($companyId);
                        fwrite($cHandle, $insertHeader . "\n");
                        fwrite($cHandle, $newLine);
                        continue;
                    } elseif ($companyIdIndex === false) {
                        foreach ($indicesToRemove as $idx) {
                            unset($values[$idx]);
                        }
                        $newLine = "(" . implode(', ', $values) . ");\n";
                        fwrite($sharedHandle, $insertHeader . "\n");
                        fwrite($sharedHandle, $newLine);
                        continue;
                    }
                }
            }
            if ($companyIdIndex === false && empty($indicesToRemove)) {
                fwrite($sharedHandle, $line);
            }
        }
        continue;
    }
    
    // For CREATE TABLE, just skip writing the entire line if it's company_id
    if (preg_match('/^\s*`company_id` [^,]+,/', $line)) {
        continue;
    }

    fwrite($sharedHandle, $line);
}

fclose($handle);
fclose($sharedHandle);

foreach ($companyHandles as $ch) {
    fwrite($ch, "\nCOMMIT;\nSET FOREIGN_KEY_CHECKS=1;\n");
    fclose($ch);
}

echo "Done! Separated SQL files are in database/separated_dumps/\n";
