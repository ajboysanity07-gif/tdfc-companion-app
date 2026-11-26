// Shared by the loan list and loan detail pages (design/loan-transactions.html).
import { Badge, mockupText } from '@/components/tdfc/ui';

/** Local YYYY-MM-DD. */
export const today = () => new Date().toLocaleDateString('en-CA');

const dayNo = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 864e5;

export function dueInfo(iso: string, now = today()): ['bad' | 'warn' | 'info', string] {
    const n = dayNo(iso) - dayNo(now);
    return n < 0 ? ['bad', 'Past due'] : n === 0 ? ['warn', 'Due today'] : ['info', `Due in ${n} day${n === 1 ? '' : 's'}`];
}

export const DueBadge = ({ date }: { date: string }) => {
    const [tone, text] = dueInfo(date);
    return <Badge tone={tone}>{text}</Badge>;
};

export type RowState = 'paid' | 'late' | 'due' | 'upcoming';

/** What a schedule row means today: any unpaid row with a date behind us is past due. */
export const rowState = (r: { status: 'paid' | 'due' | 'upcoming'; date: string | null }, now = today()): RowState =>
    r.status !== 'paid' && r.date && r.date < now ? 'late' : r.status;

export const paidPct = (balance: number, principal: number) =>
    principal ? Math.round(Math.min(100, Math.max(0, ((principal - balance) / principal) * 100))) : 0;

// Padding follows the mockup: 16px up to 860px (24px above the mobile nav), 24px beyond.
export const pageFrame = `grid grid-cols-[minmax(0,1fr)] content-start gap-5 p-4 max-md:pb-6 min-[861px]:p-6 ${mockupText}`;
export const hero =
    'flex flex-wrap items-center justify-between gap-x-8 gap-y-5 rounded-tdfc-card bg-tdfc-coral px-7 py-6 text-tdfc-on-coral max-[861px]:p-5';
export const heroBig = 'my-1 block text-[clamp(36px,5vw,52px)] leading-[1.15] font-extrabold tracking-[-0.02em] tabular-nums';
export const payCard =
    'grid flex-[0_1_380px] justify-items-start gap-1.5 rounded-[14px] bg-card px-5 py-[18px] text-foreground max-[861px]:basis-full';
export const payAmount = 'text-[28px] leading-[1.2] font-extrabold tabular-nums';
