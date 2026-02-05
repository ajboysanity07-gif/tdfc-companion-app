import { useMyTheme } from '@/hooks/use-mytheme';

type ProductListSkeletonProps = {
    itemCount?: number;
    fullHeight?: boolean;
};

export default function ProductListSkeleton({ itemCount = 5, fullHeight = false }: ProductListSkeletonProps) {
    const tw = useMyTheme();
    
    return (
        <>
            {/* List items skeleton */}
            <div 
                style={{
                    flex: fullHeight ? 1 : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingBottom: '16px',
                }}
            >
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg flex items-center"
                        style={{ 
                            backgroundColor: tw.isDark ? '#262626' : '#F5F5F5',
                            padding: '16px',
                            gap: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
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
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600,
                                    marginRight: '4px',
                                    color: tw.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' 
                                }}>
                                    Tags:
                                </span>
                                <div 
                                    className="rounded animate-pulse" 
                                    style={{
                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        height: '18px',
                                        width: '50px'
                                    }}
                                />
                                <div 
                                    className="rounded animate-pulse" 
                                    style={{
                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        height: '18px',
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
            <div className="flex flex-row justify-center gap-2" style={{ paddingBottom: '16px' }}>
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
        </>
    );
}
