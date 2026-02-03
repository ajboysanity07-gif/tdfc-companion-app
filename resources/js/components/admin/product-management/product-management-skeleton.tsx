import { useMediaQuery } from '@/hooks/use-media-query';
import ProductListSkeleton from './product-list-skeleton';
import { PRODUCT_LIST_PAGE_SIZE } from './skeletons';
import { useMyTheme } from '@/hooks/use-mytheme';

type ProductManagementSkeletonProps = {
    itemCount?: number;
};

export default function ProductManagementSkeleton({ itemCount = PRODUCT_LIST_PAGE_SIZE }: ProductManagementSkeletonProps) {
    const isMobile = useMediaQuery('(max-width:900px)');
    const tw = useMyTheme();

    return (
        <div className="flex flex-col overflow-x-auto transition-colors duration-300" style={{ backgroundColor: tw.isDark ? '#0a0a0a' : '#FFFFFF' }}>
            {isMobile ? (
                <div className="px-4" style={{ paddingTop: 0 }}>
                    <div className="rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col gap-2 p-4" style={{ backgroundColor: tw.isDark ? '#171717' : '#FAFAFA' }}>
                        <ProductListSkeleton itemCount={itemCount} fullHeight />
                    </div>
                </div>
            ) : (
                <div className="px-4 lg:flex lg:flex-col lg:h-full flex-1" style={{ paddingTop: 0 }}>
                    <div className="flex gap-2 h-full">
                        <div className="flex-1">
                            <div className="rounded-3xl border border-gray-200 dark:border-neutral-700 shadow-sm flex flex-col gap-2 p-4 h-full" style={{ backgroundColor: tw.isDark ? '#171717' : '#FAFAFA' }}>
                                <ProductListSkeleton itemCount={itemCount} fullHeight />
                            </div>
                        </div>
                        <div className="flex-1 rounded-2xl p-3 animate-pulse" style={{ backgroundColor: tw.isDark ? '#1a1a1a' : '#FAFAFA' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
}
