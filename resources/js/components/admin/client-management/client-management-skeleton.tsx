import { useMediaQuery } from '@/hooks/use-media-query';
import ClientListSkeleton from './skeletons/client-list-skeleton';
import ClientDetailsSkeleton from './skeletons/client-details-skeleton';
import { CLIENT_LIST_PAGE_SIZE } from './skeletons';
import { useMyTheme } from '@/hooks/use-mytheme';

type ClientManagementSkeletonProps = {
    itemCount?: number;
    isMobile?: boolean;
    selectedId?: number | null;
};

export default function ClientManagementSkeleton({ itemCount = CLIENT_LIST_PAGE_SIZE, isMobile = false, selectedId = null }: ClientManagementSkeletonProps) {
    const isResponsiveMobile = useMediaQuery('(max-width:900px)');
    const tw = useMyTheme();
    
    return (
        <div className="flex flex-col overflow-x-auto transition-colors duration-300" style={{ backgroundColor: tw.isDark ? '#0a0a0a' : '#FFFFFF' }}>
            {isResponsiveMobile ? (
                // Mobile view - show either list or details based on selection
                selectedId ? (
                    <div className="px-4" style={{ paddingTop: 0 }}>
                        <div className="rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-sm p-4 flex flex-col gap-4" style={{ backgroundColor: tw.isDark ? '#171717' : '#FFFFFF' }}>
                            <ClientDetailsSkeleton />
                        </div>
                    </div>
                ) : (
                    <div className="px-4" style={{ paddingTop: 0 }}>
                        <div className="rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col gap-2 p-4" style={{ backgroundColor: tw.isDark ? '#171717' : '#FFFFFF' }}>
                            <ClientListSkeleton itemCount={itemCount} fullHeight showTabs />
                        </div>
                    </div>
                )
            ) : (
                // Desktop view - show both list and details side by side
                <div className="px-4 lg:flex lg:flex-col lg:h-full flex-1" style={{ paddingTop: 0 }}>
                    <div className="flex gap-2 h-full">
                        <div className="flex-1">
                            <div className="rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col gap-2 p-4 h-full" style={{ backgroundColor: tw.isDark ? '#171717' : '#FFFFFF' }}>
                                <ClientListSkeleton itemCount={itemCount} fullHeight showTabs />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-sm p-4 flex flex-col gap-4 h-full" style={{ backgroundColor: tw.isDark ? '#171717' : '#FFFFFF' }}>
                                <ClientDetailsSkeleton />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
