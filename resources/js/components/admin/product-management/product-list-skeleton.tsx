import { useMyTheme } from '@/hooks/use-mytheme';

type ProductListSkeletonProps = {
    itemCount?: number;
    fullHeight?: boolean;
};

export default function ProductListSkeleton({ itemCount = 5, fullHeight = false }: ProductListSkeletonProps) {
    const tw = useMyTheme();
    
    return (
        <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}>
            {/* List items skeleton */}
            <div className={`flex flex-col gap-2 ${fullHeight ? 'flex-1' : 'auto'}`}>
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg p-4 flex justify-between items-center"
                        style={{ backgroundColor: tw.isDark ? '#262626' : '#F5F5F5' }}
                    >
                        <div className="flex flex-row gap-4 flex-1 items-center">
                            {/* Toggle switch skeleton */}
                            <div className="rounded-full bg-neutral-600 dark:bg-neutral-700 h-6 w-10 animate-pulse" />
                            
                            {/* Title and tags skeleton */}
                            <div className="flex-1">
                                <div className="rounded bg-neutral-600 dark:bg-neutral-700 h-5 w-32 mb-2 animate-pulse" />
                                <div className="flex gap-2">
                                    <div className="rounded bg-neutral-600 dark:bg-neutral-700 h-3 w-16 animate-pulse" />
                                    <div className="rounded bg-neutral-600 dark:bg-neutral-700 h-3 w-20 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Arrow icon skeleton */}
                        <div className="rounded-full bg-neutral-600 dark:bg-neutral-700 h-8 w-8 animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-row justify-center gap-2 mt-4">
                <div className="rounded bg-neutral-600 dark:bg-neutral-700 h-9 w-16 animate-pulse" />
                <div className="rounded bg-neutral-600 dark:bg-neutral-700 h-9 w-14 animate-pulse" />
                <div className="rounded bg-neutral-600 dark:bg-neutral-700 h-9 w-16 animate-pulse" />
            </div>
        </div>
    );
}
