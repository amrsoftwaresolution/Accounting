-- Company 3 Dump
SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb84-7345-8656-bdbe8f8086d4', NULL, '1000', 'Cash on Hand', 'asset', 'cash-and-cash-equivalents', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb85-71d6-a9ed-761138c28d29', NULL, '1010', 'Main Bank Account', 'asset', 'cash-and-cash-equivalents', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb86-729d-b0d5-f80258add97a', NULL, '1100', 'Accounts Receivable', 'asset', 'accounts-receivable', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb86-729d-b0d5-f8025991c5d3', NULL, '1200', 'Inventory Asset', 'asset', 'current-assets', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb87-73da-9f62-bba636b30d9a', NULL, '2000', 'Accounts Payable', 'liability', 'accounts-payable', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb88-7156-af79-474f7d4180d0', NULL, '2100', 'Credit Card', 'liability', 'credit-card', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb88-7156-af79-474f7d9ef23b', NULL, '3000', 'Opening Balance Equity', 'equity', 'owners-equity', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb89-73e8-b45b-4b67760f4aee', NULL, '3100', 'Retained Earnings', 'equity', 'owners-equity', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb89-73e8-b45b-4b6776c81a7b', NULL, '4000', 'Sales Income', 'income', 'income', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb8a-734c-86e5-8e44c02d529b', NULL, '4100', 'Service Income', 'income', 'income', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb8a-734c-86e5-8e44c107caed', NULL, '5000', 'Cost of Goods Sold', 'expense', 'expense', 'LKR', NULL, 1312.72, 1, 0, '2026-06-02 07:41:29', '2026-06-10 06:24:45');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb8b-7165-a699-f19cbd186637', NULL, '5100', 'Rent Expense', 'expense', 'expense', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb8b-7165-a699-f19cbdab7626', NULL, '5200', 'Utilities Expense', 'expense', 'expense', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `chart_of_accs` (`id`, `parent_id`, `account_code`, `name`, `account_type`, `sub_type`, `currency`, `description`, `balance`, `is_active`, `is_locked`, `created_at`, `updated_at`) VALUES
('019e8747-cb8c-738c-8f8a-d191a4a87bc4', NULL, '5300', 'Office Expense', 'expense', 'expense', 'LKR', NULL, 0.00, 1, 0, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `journal_entries` (`id`, `date`, `due_date`, `reference`, `description`, `payee_id`, `payee_type`, `payment_method_id`, `transaction_type`, `transactionable_type`, `transactionable_id`, `total_amount`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('019eb034-6987-70f7-896c-61ccb26313a6', '2026-05-29', NULL, 'EXP-8199', 'Sample Expense 1 for Company TGL Kandy', '019eb034-6984-710e-ae71-f3f6c2f7a180', 'App\\Models\\Supplier', NULL, 'expense', 'App\\Models\\Expense', '019eb034-6986-7277-aa3b-95684e141ce9', 314.95, 'posted', '019e8746-570f-72cd-b4d0-c9b551487ed4', '2026-06-10 06:24:45', '2026-06-10 06:24:45');
INSERT INTO `journal_entries` (`id`, `date`, `due_date`, `reference`, `description`, `payee_id`, `payee_type`, `payment_method_id`, `transaction_type`, `transactionable_type`, `transactionable_id`, `total_amount`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('019eb034-698b-70f8-a1fa-821d5ca0f73a', '2026-06-06', NULL, 'EXP-6669', 'Sample Expense 2 for Company TGL Kandy', '019eb034-6984-710e-ae71-f3f6c2f7a180', 'App\\Models\\Supplier', NULL, 'expense', 'App\\Models\\Expense', '019eb034-698a-72ad-b1ba-69a8cd77a0d4', 317.20, 'posted', '019e8746-570f-72cd-b4d0-c9b551487ed4', '2026-06-10 06:24:45', '2026-06-10 06:24:45');
INSERT INTO `journal_entries` (`id`, `date`, `due_date`, `reference`, `description`, `payee_id`, `payee_type`, `payment_method_id`, `transaction_type`, `transactionable_type`, `transactionable_id`, `total_amount`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('019eb034-698e-71b2-b3ed-2b544e28d848', '2026-05-28', NULL, 'EXP-5142', 'Sample Expense 3 for Company TGL Kandy', '019eb034-6984-710e-ae71-f3f6c2f7a180', 'App\\Models\\Supplier', NULL, 'expense', 'App\\Models\\Expense', '019eb034-698e-71b2-b3ed-2b544d375545', 138.50, 'posted', '019e8746-570f-72cd-b4d0-c9b551487ed4', '2026-06-10 06:24:45', '2026-06-10 06:24:45');
INSERT INTO `journal_entries` (`id`, `date`, `due_date`, `reference`, `description`, `payee_id`, `payee_type`, `payment_method_id`, `transaction_type`, `transactionable_type`, `transactionable_id`, `total_amount`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('019eb034-6992-7135-bd99-2ea1a7e176b7', '2026-05-22', NULL, 'EXP-3311', 'Sample Expense 4 for Company TGL Kandy', '019eb034-6984-710e-ae71-f3f6c2f7a180', 'App\\Models\\Supplier', NULL, 'expense', 'App\\Models\\Expense', '019eb034-6991-7078-a069-beb89a805ca9', 232.97, 'posted', '019e8746-570f-72cd-b4d0-c9b551487ed4', '2026-06-10 06:24:45', '2026-06-10 06:24:45');
INSERT INTO `journal_entries` (`id`, `date`, `due_date`, `reference`, `description`, `payee_id`, `payee_type`, `payment_method_id`, `transaction_type`, `transactionable_type`, `transactionable_id`, `total_amount`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('019eb034-6995-715f-8d57-5bd82e6e7fe4', '2026-06-08', NULL, 'EXP-5177', 'Sample Expense 5 for Company TGL Kandy', '019eb034-6984-710e-ae71-f3f6c2f7a180', 'App\\Models\\Supplier', NULL, 'expense', 'App\\Models\\Expense', '019eb034-6994-7195-8580-0dec5b6a4525', 309.10, 'posted', '019e8746-570f-72cd-b4d0-c9b551487ed4', '2026-06-10 06:24:45', '2026-06-10 06:24:45');
INSERT INTO `payment_methods` (`id`, `name`, `slug`, `is_active`, `created_at`, `updated_at`) VALUES
('019e8747-cb8d-73f2-95d3-675430d68067', 'Cash', 'cash', 1, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `payment_methods` (`id`, `name`, `slug`, `is_active`, `created_at`, `updated_at`) VALUES
('019e8747-cb8d-73f2-95d3-6754316822d1', 'Bank Transfer', 'bank-transfer', 1, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `payment_methods` (`id`, `name`, `slug`, `is_active`, `created_at`, `updated_at`) VALUES
('019e8747-cb8e-71a2-9309-e7c5671e3354', 'Credit Card', 'credit-card', 1, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `payment_methods` (`id`, `name`, `slug`, `is_active`, `created_at`, `updated_at`) VALUES
('019e8747-cb8e-71a2-9309-e7c56735eafe', 'Cheque', 'cheque', 1, '2026-06-02 07:41:29', '2026-06-02 07:41:29');
INSERT INTO `suppliers` (`id`, `display_name`, `first_name`, `last_name`, `company_name`, `email`, `phone_number`, `tax_id`, `opening_balance`, `created_at`, `updated_at`) VALUES
('019eb034-6984-710e-ae71-f3f6c2f7a180', 'Sample Supplier', 'Sample', 'Supplier', NULL, 'supplier@example.com', NULL, NULL, 0.00, '2026-06-10 06:24:45', '2026-06-10 06:24:45');

COMMIT;
SET FOREIGN_KEY_CHECKS=1;
