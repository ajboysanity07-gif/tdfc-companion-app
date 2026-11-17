import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (

        <div className={cn('inline-flex gap-1 rounded-[10px] bg-muted p-1', className)} {...props}>
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    aria-pressed={appearance === value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex h-[34px] items-center gap-1.5 rounded-lg px-3.5 transition-colors',
                        appearance === value
                            ? 'bg-background font-semibold text-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-border hover:text-foreground',
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
