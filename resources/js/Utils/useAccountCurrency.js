import { useEffect, useState } from "react";
import axios from "axios";

export function useAccountCurrency({
    accountId,
    accountOptions,
    exchangeRate,
    currencyId,
    setData,
    apiDetailRoute = 'api.accounts.detail',
    defaultCurrencyCode = 'LKR',
    currencyIdField = 'currency_id',
    exchangeRateField = 'exchange_rate'
}) {
    const [accountCurrencyDetails, setAccountCurrencyDetails] = useState(null);
    const [loadedAccountId, setLoadedAccountId] = useState(null);

    const resetAccountCurrencyDetails = () => {
        setAccountCurrencyDetails(null);
        setLoadedAccountId(null);
        setData(exchangeRateField, '');
        setData(currencyIdField, null);
    };

    const loadAccountCurrencyDetails = async (selectedAccountId, preserveExistingRate = false) => {
        if (!selectedAccountId) {
            resetAccountCurrencyDetails();
            return;
        }

        const selectedAccount = accountOptions.find(a => String(a.value) === String(selectedAccountId));
        const currencyCode = selectedAccount?.currency_code || defaultCurrencyCode;

        if (currencyCode === defaultCurrencyCode) {
            resetAccountCurrencyDetails();
            return;
        }

        try {
            const response = await axios.get(route(apiDetailRoute, { account_id: selectedAccountId }));
            const details = response.data;
            setAccountCurrencyDetails(details);
            setData(currencyIdField, details.currency_id || null);

            const shouldUpdateRate = !preserveExistingRate || !exchangeRate || String(loadedAccountId) !== String(selectedAccountId);
            if (shouldUpdateRate) {
                setData(exchangeRateField, details.latest_exchange_rate ? String(details.latest_exchange_rate) : '');
            }

            setLoadedAccountId(selectedAccountId);
        } catch (error) {
            console.error('Failed to load account currency details:', error);
            resetAccountCurrencyDetails();
        }
    };

    useEffect(() => {
        if (!accountId || accountOptions.length === 0) {
            return;
        }

        const selectedAccount = accountOptions.find(a => String(a.value) === String(accountId));
        if (!selectedAccount) {
            return;
        }

        const currencyCode = selectedAccount?.currency_code || defaultCurrencyCode;
        if (currencyCode === defaultCurrencyCode) {
            if (accountCurrencyDetails) {
                resetAccountCurrencyDetails();
            }
            return;
        }

        if (!accountCurrencyDetails || accountCurrencyDetails.currency_code !== currencyCode) {
            loadAccountCurrencyDetails(accountId, true);
        }
    }, [accountId, accountOptions]);

    return {
        accountCurrencyDetails,
        loadAccountCurrencyDetails,
        resetAccountCurrencyDetails,
    };
}
