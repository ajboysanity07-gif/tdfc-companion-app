import { Panel } from '@/components/tdfc/ui';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type QueueItem = { id: string | number; name: string; at: string; onClick?: () => void; href?: string };

const SHOWN = 5;

/** Button/link styling for the action inside the coral panel. */
export const queueAction =
    'mt-4.5 inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] bg-tdfc-on-coral px-4 font-bold text-tdfc-coral-ink hover:bg-[color-mix(in_oklch,var(--on-brand-surface)_90%,var(--brand-surface))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tdfc-on-coral max-[720px]:w-full';

/** "Waiting for your review" panel beside the metrics card; `items` must already be oldest first. */
export function ReviewSummary({
    count,
    note,
    action,
    items,
    metricsLabel,
    children,
}: {
    count: number;
    note: string;
    action?: ReactNode;
    items: QueueItem[];
    metricsLabel: string;
    children: ReactNode;
}) {
    const row = 'flex w-full items-center justify-between gap-3 text-left tabular-nums';
    const hit = `${row} group min-h-11 cursor-pointer focus-visible:outline-2 focus-visible:outline-tdfc-on-coral`;
    return (
        <div className="grid gap-3.5 min-[1101px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section aria-label="Waiting for your review" className="grid items-center gap-x-10 gap-y-5 rounded-[20px] bg-tdfc-coral px-7 py-6 text-tdfc-on-coral min-[721px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] max-[720px]:p-5">
                <div>
                    <h2 className="text-base font-bold">Waiting for your review</h2>
                    <b aria-live="polite" className="my-2 block text-[72px] leading-none font-extrabold tracking-[-.03em] tabular-nums">{count}</b>
                    <p>{note}</p>
                    {action}
                </div>
                {items.length > 0 && (
                    <div>
                        <h3 className="pb-1.5 text-xs font-semibold">Oldest first, by date submitted</h3>
                        <ol>
                            {items.slice(0, SHOWN).map((x, i) => {
                                const date = new Date(x.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const cells = (
                                    <>
                                        <span className="group-hover:underline group-hover:underline-offset-3">{x.name}</span>
                                        <span className="whitespace-nowrap">{date}</span>
                                    </>
                                );
                                return (
                                    <li key={x.id} className={`border-t border-tdfc-on-coral/35 ${i === 0 ? 'text-[17px] font-bold' : ''}`}>
                                        {x.href ? (
                                            <Link href={x.href} className={hit}>
                                                {cells}
                                            </Link>
                                        ) : x.onClick ? (
                                            <button type="button" onClick={x.onClick} aria-label={`Review ${x.name}, submitted ${date}`} className={hit}>
                                                {cells}
                                            </button>
                                        ) : (
                                            <div className={`${row} py-[7px]`}>{cells}</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                        {items.length > SHOWN && <p className="border-t border-tdfc-on-coral/35 pt-2 text-xs font-semibold">+{items.length - SHOWN} more</p>}
                    </div>
                )}
            </section>
            <Panel className="grid overflow-hidden">
                <dl aria-label={metricsLabel} className="grid divide-y divide-border">
                    {children}
                </dl>
            </Panel>
        </div>
    );
}

/** One row of the metrics card; `pct` adds the progress bar. */
export const Metric = ({ label, value, hint, pct }: { label: string; value: ReactNode; hint: string; pct?: number }) => (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] content-center items-center gap-x-3 gap-y-0.5 px-5 py-3.5">
        <dt className="font-semibold">{label}</dt>
        <dd className="col-start-2 row-span-2 row-start-1 text-[22px] font-bold whitespace-nowrap tabular-nums">{value}</dd>
        <dd className="col-start-1 text-xs text-muted-foreground">{hint}</dd>
        {pct !== undefined && (
            <dd aria-hidden className="col-span-full mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <i className="block h-full rounded-full bg-tdfc-blue" style={{ width: `${pct}%` }} />
            </dd>
        )}
    </div>
);

export const ListHeading = ({ title, sub }: { title: string; sub: string }) => (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-muted-foreground">{sub}</span>
    </div>
);
