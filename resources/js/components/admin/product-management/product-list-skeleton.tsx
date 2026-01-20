import { List, ListItem, Stack, Box } from '@mui/material';
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
            <Box className="rounded-lg bg-neutral-700 h-10 w-full mb-2 animate-pulse" />

            {/* List items skeleton */}
            <List sx={{ flex: fullHeight ? 1 : 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Array.from({ length: itemCount }).map((_, i) => (
                    <ListItem
                        key={i}
                        sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: tw.isDark ? '#262626' : '#FFFFFF',
                        }}
                    >
                        <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'center' }}>
                            {/* Toggle switch skeleton */}
                            <Box className="rounded-full bg-neutral-600 h-6 w-10 animate-pulse" />
                            
                            {/* Title skeleton */}
                            <Stack sx={{ flex: 1 }}>
                                <Box className="rounded bg-neutral-700 h-4 w-32 mb-2 animate-pulse" />
                                <Box className="rounded bg-neutral-700 h-3 w-24 animate-pulse" />
                            </Stack>
                        </Stack>

                        {/* Arrow icon skeleton */}
                        <Box className="rounded bg-neutral-700 h-5 w-5 animate-pulse" />
                    </ListItem>
                ))}
            </List>

            {/* Pagination skeleton */}
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                <Box className="rounded bg-neutral-700 h-8 w-16 animate-pulse" />
                <Box className="rounded bg-neutral-700 h-8 w-12 animate-pulse" />
                <Box className="rounded bg-neutral-700 h-8 w-16 animate-pulse" />
            </Stack>
        </>
    );
}
