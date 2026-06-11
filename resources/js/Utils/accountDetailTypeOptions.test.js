import { describe, expect, it } from 'vitest';
import { getDetailTypeOptions } from './accountDetailTypeOptions';

describe('getDetailTypeOptions', () => {
    it('returns only expense-related detail types for expense accounts', () => {
        const options = getDetailTypeOptions('expense');

        expect(options.map(option => option.value)).toEqual([
            'expense',
            'cost-of-goods-sold',
        ]);

        expect(options.some(option => option.value === 'accounts-receivable')).toBe(false);
        expect(options.some(option => option.value === 'credit-card')).toBe(false);
    });

    it('returns the correct detail types for other account types', () => {
        expect(getDetailTypeOptions('asset').map(option => option.value)).toContain('cash-and-cash-equivalents');
        expect(getDetailTypeOptions('liability').map(option => option.value)).toContain('accounts-payable');
        expect(getDetailTypeOptions('income').map(option => option.value)).toContain('income');
    });
});
