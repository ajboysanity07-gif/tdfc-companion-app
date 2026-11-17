import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { Badge, btn, Panel } from '@/components/tdfc/ui';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Appearance settings', href: '/settings/appearance' }];

export default function Appearance() {
    const name = usePage<SharedData>().props.auth.user.name;
    const initials = name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="grid max-w-[640px] gap-5">
                    <div>
                        <h2 className="text-lg font-semibold">Appearance settings</h2>
                        <p className="text-sm text-muted-foreground">Update your account's appearance settings</p>
                    </div>

                    <AppearanceTabs className="justify-self-start" />

                    <Panel>
                        <h3 className="border-b border-border px-5 py-3.5 font-semibold">Preview</h3>
                        <div className="grid gap-3.5 p-5">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-full bg-tdfc-coral-soft text-sm font-bold text-tdfc-coral-ink">{initials}</span>
                                <div>
                                    <b>{name}</b>
                                    <p className="text-sm text-muted-foreground">Approved client</p>
                                </div>
                                <span className="ml-auto">
                                    <Badge tone="ok">Active</Badge>
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <i className="block h-full w-3/5 rounded-full bg-tdfc-blue" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" className={`${btn.base} ${btn.dark}`}>Primary</button>
                                <button type="button" className={`${btn.base} ${btn.plain} dark:bg-card`}>Secondary</button>
                                <button type="button" className={`${btn.base} ${btn.danger}`}>Destructive</button>
                            </div>
                        </div>
                    </Panel>

                    <p className="text-[13px] text-muted-foreground">Your choice is saved in this browser and shared across the settings pages.</p>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
