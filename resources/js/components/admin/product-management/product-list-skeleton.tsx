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
                        className="rounded-lg flex items-center"
                        style={{ 
                            backgroundColor: tw.isDark ? '#262626' : '#F5F5F5',
                            padding: '16px',
                            gap: '16px'
                        }}
                    >
                        {/* Toggle switch skeleton */}
                        <div 
                            className="rounded-full animate-pulse" 
                            style={{
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                height: '24px',
                                width: '44px',
                                flexShrink: 0
                            }}
                        />
                        
                        {/* Title and tags skeleton */}
                        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Product name skeleton */}
                            <div 
                                className="rounded animate-pulse" 
                                style={{
                                    backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    height: '20px',
                                    width: '140px'
                                }}
                            />
                            {/* Tags skeleton */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ 
                                    fontSize: '0.875rem', 
                                    color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' 
                                }}>
                                    Tags:
                                </span>
                                <div 
                                    className="rounded animate-pulse" 
                                    style={{
                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        height: '16px',
                                        width: '50px'
                                    }}
                                />
                                <div 
                                    className="rounded animate-pulse" 
                                    style={{
                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        height: '16px',
                                        width: '50px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Arrow button skeleton */}
                        <div 
                            className="rounded-full animate-pulse" 
                            style={{
                                backgroundColor: tw.isDark ? '#ef4444' : '#fecaca',
                                height: '40px',
                                width: '40px',
                                flexShrink: 0
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex flex-row justify-center gap-2 mt-4">
                <div 
                    className="rounded animate-pulse" 
                    style={{
                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        height: '36px',
                        width: '64px'
                    }}
                />
                <div 
                    className="rounded animate-pulse" 
                    style={{
                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        height: '36px',
                        width: '56px'
                    }}
                />
                <div 
                    className="rounded animate-pulse" 
                    style={{
                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        height: '36px',
                        width: '64px'
                    }}
                />
            </div>
        </div>
    );
}
