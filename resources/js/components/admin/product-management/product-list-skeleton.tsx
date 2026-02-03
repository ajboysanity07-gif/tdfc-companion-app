import { useMyTheme } from '@/hooks/use-mytheme';

type ProductListSkeletonProps = {
    itemCount?: number;
    fullHeight?: boolean;
};

export default function ProductListSkeleton({ itemCount = 5, fullHeight = false }: ProductListSkeletonProps) {
    const tw = useMyTheme();
    
    return (
        <>
            {/* Search bar skeleton */}
            <div className="rounded-lg bg-neutral-700 h-10 w-full mb-2 animate-pulse" />

            {/* List items skeleton */}
            <div className={`flex flex-col gap-1 ${fullHeight ? 'flex-1' : 'auto'}`}>
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-200 dark:border-neutral-700 p-2 flex justify-between items-center"
                        style={{ backgroundColor: tw.isDark ? '#262626' : '#FFFFFF' }}
                    >
                        <div className="flex flex-row gap-2 flex-1 items-center">
                            {/* Toggle switch skeleton */}
                            <div className="rounded-full bg-neutral-600 h-6 w-10 animate-pulse" />
                            
                            {/* Title skeleton */}
                            <div className="flex-1">
                                <div className="rounded bg-neutral-700 h-4 w-32 mb-2 animate-pulse" />
                                <div className="rounded bg-neutral-700 h-3 w-24 animate-pulse" />
                            </div>
                        </div>

                        {/* Arrow icon skeleton */}
                        <div className="rounded bg-neutral-700 h-5 w-5 animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-row justify-center gap-1 mt-2">
                <div className="rounded bg-neutral-700 h-8 w-16 animate-pulse" />
                <div className="rounded bg-neutral-700 h-8 w-12 animate-pulse" />
                <div className="rounded bg-neutral-700 h-8 w-16 animate-pulse" />
            </div>
        </>
    );
}
