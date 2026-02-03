import { useMyTheme } from '@/hooks/use-mytheme';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DesktopViewLayoutProps = {
    left: ReactNode;
    right: ReactNode;
    afterStack?: ReactNode;
    wrapperSx?: React.CSSProperties;
    leftSx?: React.CSSProperties;
    rightSx?: React.CSSProperties;
    stackProps?: React.HTMLAttributes<HTMLDivElement>;
};

export default function DesktopViewLayout({
    left,
    right,
    afterStack,
    wrapperSx,
    leftSx,
    rightSx,
    stackProps,
}: DesktopViewLayoutProps) {
    const tw = useMyTheme();

    const panelClasses = cn(
        'flex-1 rounded-md border p-4 min-h-[850px] flex flex-col',
        tw.isDark 
            ? 'bg-neutral-900 border-neutral-700/70 shadow-sm shadow-black/12' 
            : 'bg-white border-gray-200 shadow-sm shadow-black/12',
    );

    return (
        <div
            className={cn(
                'flex flex-1 flex-col gap-0 p-4 pt-0 transition-colors duration-300',
                tw.isDark ? 'bg-neutral-950' : 'bg-gray-100',
            )}
            style={wrapperSx}
        >
            <div className="flex flex-row gap-2 items-stretch" {...stackProps}>
                <div className={panelClasses} style={leftSx}>
                    {left}
                </div>
                <div className={panelClasses} style={rightSx}>
                    {right}
                </div>
            </div>
            {afterStack}
        </div>
    );
}
