import { useMyTheme } from '@/hooks/use-mytheme';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MobileViewLayoutProps = {
    children: ReactNode;
    footer?: ReactNode;
    wrapperSx?: React.CSSProperties;
    stackSx?: React.CSSProperties;
};

export default function MobileViewLayout({ children, footer, wrapperSx, stackSx }: MobileViewLayoutProps) {
    const tw = useMyTheme();

    return (
        <div
            className={cn(
                'flex flex-1 flex-col gap-0 p-2 pt-0 pb-24 sm:pb-2 min-h-auto',
                tw.isDark ? 'bg-neutral-950' : 'bg-gray-100',
            )}
            style={wrapperSx}
        >
            <div
                className={cn(
                    'flex flex-col justify-start w-full max-w-2xl mx-auto rounded-lg border p-2',
                    tw.isDark 
                        ? 'bg-neutral-900 border-neutral-700/70 shadow-sm shadow-black/12' 
                        : 'bg-white border-gray-200 shadow-sm shadow-black/12',
                )}
                style={stackSx}
            >
                {children}
            </div>
            {footer && <div className="mt-auto">{footer}</div>}
        </div>
    );
}
