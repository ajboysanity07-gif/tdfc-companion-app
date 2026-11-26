// The cooperative's "Loans Calculator.xlsx" as one pure function. No imports, so `node --test` can run it.

export type LoanMode = 'MONTHLY' | 'SEMI-ANNUAL' | 'DUE-DATE';

export type LoanProduct = {
    scheme: 'ADD-ON' | 'PREPAID';
    mode: LoanMode;
    interest_rate: number; // % a year
    service_fee: number; // % of principal
    lrf: number; // % of principal
    document_stamp: number; // % of principal
    mort_plus_notarial: number; // pesos
    custom_fees: { label: string; type: 'percent' | 'fixed'; value: number }[];
    cutoff_day: number;
};

/** Days in one payment period (a due-date term is typed in days). */
export const PERIOD_DAYS: Record<LoanMode, number> = { MONTHLY: 30, 'SEMI-ANNUAL': 180, 'DUE-DATE': 1 };

// Half-up like Excel's ROUND: toFixed absorbs float noise such as 1012.4999999999999.
const round = (n: number, digits = 2) => Math.round(+(n * 10 ** digits).toFixed(6)) / 10 ** digits;

/** `payment` is per period (due date: the lump sum), `days` the term, `day` today's day of the month. */
export function computeLoan(p: LoanProduct, payment: number, days: number, day: number, old = 0) {
    const rate = p.interest_rate / 100;
    const periods = !days ? 0 : p.mode === 'DUE-DATE' ? 1 : days / PERIOD_DAYS[p.mode];
    const total = round(payment * periods);
    const prepaid = p.scheme === 'PREPAID';
    const principal = prepaid ? total : round(total / round(1 + (rate * days) / 360, 3));
    const interest = prepaid ? round((total * rate * days) / 360) : round(total - principal);

    const percent = (v: number) => round((principal * v) / 100);
    const sf = percent(p.service_fee);
    const lrf = percent(p.lrf);
    const ds = percent(p.document_stamp);
    const mn = days ? p.mort_plus_notarial : 0;
    const custom = p.custom_fees.map((f) => ({ label: f.label, fee: !days ? 0 : f.type === 'percent' ? percent(f.value) : f.value }));
    // Cut-off charges cover the days left in a 30-day month, from the cut-off day on.
    const stub = day < p.cutoff_day ? 0 : Math.max(0, 30 - day);
    const cutoffInterest = round(((principal * rate) / 360) * stub);
    const cutoffLrf = days ? round((lrf / days) * stub) : 0;

    const charges = round(sf + lrf + ds + mn + cutoffInterest + cutoffLrf + custom.reduce((s, c) => s + c.fee, 0));
    const deductions = round(charges + (prepaid ? interest : 0));

    return {
        periods,
        total,
        principal,
        interest,
        repayable: total,
        sf,
        lrf,
        ds,
        mn,
        custom,
        stub,
        cutoffInterest,
        cutoffLrf,
        charges,
        deductions,
        old,
        net: Math.max(0, round(principal - deductions - old)),
    };
}

/** Month of the first monthly deduction: the following month once the cut-off day is reached. */
export function firstDeduction(today: Date, cutoffDay: number) {
    return new Date(today.getFullYear(), today.getMonth() + (today.getDate() >= cutoffDay ? 1 : 0), 1);
}
