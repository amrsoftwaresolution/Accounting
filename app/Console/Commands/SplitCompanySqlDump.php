<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SplitCompanySqlDump extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:split-old-dump {file=database/u487520070_jobalign_book.sql}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Splits an old SQL dump into per-company files and transforms transaction types.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = base_path($this->argument('file'));
        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $outDir = base_path('database/separated_dumps');
        if (!is_dir($outDir)) {
            mkdir($outDir, 0755, true);
        }

        $this->info("Parsing: {$filePath}");

        $handle = fopen($filePath, 'r');
        
        $companyHandles = [];
        $sharedHandle = fopen($outDir . '/shared.sql', 'w');

        $getCompanyHandle = function ($companyId) use (&$companyHandles, $outDir) {
            if (!isset($companyHandles[$companyId])) {
                $companyHandles[$companyId] = fopen($outDir . "/company_{$companyId}.sql", 'w');
                fwrite($companyHandles[$companyId], "-- Company {$companyId} Dump\n");
                fwrite($companyHandles[$companyId], "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\nSTART TRANSACTION;\nSET time_zone = \"+00:00\";\n\n");
            }
            return $companyHandles[$companyId];
        };

        $currentTable = null;
        $companyIdIndex = -1;
        $transactionTypeIndex = -1;
        $isInsertBlock = false;
        $insertHeader = '';

        while (($line = fgets($handle)) !== false) {
            // Check for INSERT INTO
            if (preg_match('/^INSERT INTO `([^`]+)` \((.*?)\) VALUES/i', $line, $matches)) {
                $currentTable = $matches[1];
                $columnsString = $matches[2];
                preg_match_all('/`([^`]+)`/', $columnsString, $colMatches);
                $columns = $colMatches[1];
                
                $companyIdIndex = array_search('company_id', $columns);
                $transactionTypeIndex = array_search('transaction_type', $columns);
                
                $insertHeader = $line;
                $isInsertBlock = true;
                
                // If it doesn't have company_id, we write it to shared.sql
                if ($companyIdIndex === false) {
                    fwrite($sharedHandle, $line);
                }
                
                continue;
            }

            if ($isInsertBlock) {
                $trimmed = trim($line);
                // End of block if line is empty or does not start with '('
                if ($trimmed === '' || $trimmed[0] !== '(') {
                    $isInsertBlock = false;
                    $currentTable = null;
                    fwrite($sharedHandle, $line);
                } else {
                    if ($companyIdIndex !== false) {
                        preg_match('/^\((.*)\)[,;]$/', $trimmed, $valMatches);
                        if (!empty($valMatches)) {
                            // Parse CSV-like structure
                            $values = str_getcsv($valMatches[1], ',', "'");
                            $companyId = isset($values[$companyIdIndex]) ? trim($values[$companyIdIndex], " '\"") : null;

                            // We check if companyId is a valid number
                            if (is_numeric($companyId)) {
                                if ($transactionTypeIndex !== false) {
                                    $line = str_replace("'invoice'", "'credit_invoice'", $line);
                                }
                                
                                $cHandle = $getCompanyHandle($companyId);
                                // Make sure each individual insert is a complete valid statement
                                $newLine = rtrim(rtrim($line, "\r\n"), ",;") . ";\n";
                                fwrite($cHandle, rtrim($insertHeader, "\r\n") . "\n");
                                fwrite($cHandle, $newLine);
                                continue; // Skip writing to shared
                            }
                        }
                    }
                    // Fallback to shared if parsing failed or no company id
                    if ($companyIdIndex === false) {
                        fwrite($sharedHandle, $line);
                    }
                }
                continue;
            }
            
            // If not in an insert block, write to shared (like CREATE TABLE, etc.)
            fwrite($sharedHandle, $line);
        }

        fclose($handle);
        fclose($sharedHandle);
        
        foreach ($companyHandles as $ch) {
            fwrite($ch, "\nCOMMIT;\n");
            fclose($ch);
        }

        $this->info("Done! Separated SQL files are in database/separated_dumps/");
        return 0;
    }
}
