import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import MobileFab from './mobile-fab';

/** Light/dark pill. In the app shell header, or `floating` (fixed top-right) on pages without the shell. */
export default function ThemeToggle({ floating = false, className }: { floating?: boolean; className?: string }) {
    const { isDark, updateAppearance } = useAppearance();
    const target = isDark ? 'light' : 'dark';
    const pill = (
        <button
            type="button"
            onClick={() => updateAppearance(target)}
            aria-label={`Switch to ${target} mode`}
            className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card pr-3 pl-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-text md:h-9',
                floating && 'fixed top-4 right-4 z-50 shadow-lg max-md:hidden',
                className,
            )}
        >
            {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
    );
    return floating ? (
        <>
            {pill}
            <MobileFab />
        </>
    ) : (
        pill
    );
}
