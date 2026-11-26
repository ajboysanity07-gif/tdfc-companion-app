// Expected figures come from the cooperative's "Loans Calculator.xlsx". Run with: npm run test:js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeLoan, firstDeduction, type LoanProduct } from '../../resources/js/lib/loan.ts';

const sheet: LoanProduct = {
    scheme: 'ADD-ON',
    mode: 'DUE-DATE',
    interest_rate: 7.5,
    service_fee: 7,
    lrf: 1,
    document_stamp: 0.75,
    mort_plus_notarial: 0,
    custom_fees: [
        { label: 'CISP', type: 'fixed', value: 50 },
        { label: 'PS Mortuary', type: 'fixed', value: 500 },
        { label: 'Notarial Fee', type: 'fixed', value: 300 },
    ],
    cutoff_day: 5,
};

test('due date, add-on: every line matches the sheet', () => {
    const r = computeLoan(sheet, 3500, 1800, 26);
    assert.deepEqual(
        [r.total, r.principal, r.interest, r.repayable, r.sf, r.lrf, r.ds, r.cutoffInterest, r.cutoffLrf, r.deductions, r.net],
        [3500, 2545.45, 954.55, 3500, 178.18, 25.45, 19.09, 2.12, 0.06, 1074.9, 1470.55],
    );
});

test('monthly and semi-annual multiply the payment by the number of periods', () => {
    const monthly = computeLoan({ ...sheet, mode: 'MONTHLY' }, 3500, 1800, 26);
    assert.deepEqual([monthly.periods, monthly.total, monthly.principal, monthly.net], [60, 210000, 152727.27, 138382.98]);
    const semi = computeLoan({ ...sheet, mode: 'SEMI-ANNUAL' }, 3500, 1800, 26);
    assert.deepEqual([semi.periods, semi.total, semi.principal, semi.net], [10, 35000, 25454.55, 22355.49]);
});

test('prepaid deducts interest and all charges from the principal', () => {
    const r = computeLoan({ ...sheet, scheme: 'PREPAID' }, 3500, 1800, 26);
    assert.deepEqual([r.principal, r.interest, r.repayable, r.charges, r.deductions, r.net], [3500, 1312.5, 3500, 1159.25, 2471.75, 1028.25]);
});

test('the add-on factor is rounded to 3 decimals', () => {
    assert.equal(computeLoan(sheet, 100000, 30, 1).principal, 99403.58); // 1.00625 -> 1.006
    assert.equal(computeLoan(sheet, 100000, 60, 1).principal, 98716.68); // 1.0125 -> 1.013, not 1.012
});

test('stub days run from the cut-off day to day 30', () => {
    assert.deepEqual(
        [1, 4, 5, 26, 30, 31].map((day) => computeLoan(sheet, 3500, 1800, day).stub),
        [0, 0, 25, 4, 0, 0],
    );
});

test('percent custom fees use the principal and the old balance comes out of net', () => {
    const p: LoanProduct = { ...sheet, mort_plus_notarial: 100, custom_fees: [{ label: 'Insurance', type: 'percent', value: 2 }] };
    const r = computeLoan(p, 3500, 1800, 1, 1000);
    assert.deepEqual(r.custom, [{ label: 'Insurance', fee: 50.91 }]);
    assert.equal(r.mn, 100);
    assert.equal(r.net, 1171.82); // 2545.45 - 178.18 - 25.45 - 19.09 - 100 - 50.91 - 1000
});

test('net never goes below zero, and no term means nothing to compute', () => {
    assert.equal(computeLoan(sheet, 100, 1800, 26).net, 0);
    for (const mode of ['MONTHLY', 'SEMI-ANNUAL', 'DUE-DATE'] as const) {
        const r = computeLoan({ ...sheet, mode }, 3500, 0, 26);
        assert.deepEqual([r.periods, r.principal, r.cutoffLrf, r.net], [0, 0, 0, 0]);
    }
});

test('first deduction falls next month from the cut-off day', () => {
    const ym = (d: Date) => [d.getFullYear(), d.getMonth(), d.getDate()];
    assert.deepEqual(ym(firstDeduction(new Date(2026, 10, 4), 5)), [2026, 10, 1]);
    assert.deepEqual(ym(firstDeduction(new Date(2026, 10, 5), 5)), [2026, 11, 1]);
    assert.deepEqual(ym(firstDeduction(new Date(2026, 11, 31), 5)), [2027, 0, 1]);
});
