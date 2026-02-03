import { useMyTheme } from '@/hooks/use-mytheme';

type ClientListSkeletonProps = {
    itemCount?: number;
    fullHeight?: boolean;
    showTabs?: boolean;
};

export default function ClientListSkeleton({ itemCount = 5, fullHeight = false, showTabs = false }: ClientListSkeletonProps) {
    const tw = useMyTheme();
    
    return (
        <>
            {/* Tabs skeleton */}
            {showTabs && (
                <div className="flex border-b border-gray-300 dark:border-neutral-700 mb-1 sm:mb-2 animate-pulse">
                    <div className="flex-1 text-center py-2 px-3 font-semibold" style={{ color: '#F57979' }}>Approved</div>
                    <div className="flex-1 text-center py-2 px-3 text-gray-500">Pending</div>
                    <div className="flex-1 text-center py-2 px-3 text-gray-500">Rejected</div>
                </div>
            )}

            {/* Search bar skeleton */}
            <div className="rounded-lg bg-neutral-700 h-12 w-full mb-3 animate-pulse" />

            {/* List items skeleton */}
            <div className={`flex flex-col gap-2 overflow-auto ${fullHeight ? 'flex-1' : 'auto'} p-0`}>
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-200 dark:border-neutral-700 p-2 flex justify-between items-center"
                        style={{ backgroundColor: tw.isDark ? '#262626' : '#FFFFFF' }}
                    >
                        <div className="flex flex-row gap-2 flex-1 items-center">
                            {/* Avatar skeleton */}
                            <div 
                                className="animate-pulse rounded-full"
                                style={{
                                    width: 48,
                                    height: 48,
                                    backgroundColor: '#4B5563'
                                }}
                            />

                            {/* Content skeleton */}
                            <div className="flex-1">
                                {/* Name skeleton */}
                                <div className="rounded bg-neutral-700 h-5 w-48 mb-1 animate-pulse" />
                                {/* Email skeleton */}
                                <div className="rounded bg-neutral-700 h-4 w-56 animate-pulse" />
                            </div>
                        </div>

                        {/* Arrow icon skeleton */}
                        <div className="rounded-full bg-neutral-700 h-8 w-8 animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-row justify-center gap-1 mt-3">
                <div className="rounded bg-neutral-600 h-8 w-16 animate-pulse" />
                <div className="rounded bg-neutral-600 h-8 w-12 animate-pulse" />
                <div className="rounded bg-neutral-600 h-8 w-16 animate-pulse" />
            </div>
        </>
    );
}
