import { List, ListItem, Stack, Box, Avatar, Tabs, Tab } from '@mui/material';
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
                <Tabs
                    value="approved"
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ mb: { xs: 0.5, sm: 1 } }}
                    className="animate-pulse"
                >
                    <Tab
                        value="approved" 
                        label="Approved"
                        sx={{ 
                            color: '#F57979',
                            fontWeight: 600,
                            '&.Mui-selected': {
                                color: '#F57979'
                            }
                        }}
                    />
                    <Tab 
                        value="pending"
                        label="Pending"
                        sx={{ 
                            color: 'text.secondary'
                        }}
                    />
                    <Tab 
                        value="rejected"
                        label="Rejected"
                        sx={{ 
                            color: 'text.secondary'
                        }}
                    />
                </Tabs>
            )}

            {/* Search bar skeleton */}
            <Box className="rounded-lg bg-neutral-700 h-12 w-full mb-3 animate-pulse" />

            {/* List items skeleton */}
            <List sx={{ flex: fullHeight ? 1 : 'auto', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto', p: 0 }}>
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
                            '&:hover': {
                                bgcolor: tw.isDark ? '#2f2f2f' : '#FFFFFF'
                            }
                        }}
                    >
                        <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'center' }}>
                            {/* Avatar skeleton */}
                            <Avatar 
                                className="animate-pulse"
                                sx={{ 
                                    bgcolor: 'grey.600', 
                                    width: 48, 
                                    height: 48,
                                    color: 'grey.500'
                                }} 
                            >
                                👤
                            </Avatar>

                            {/* Content skeleton */}
                            <Stack sx={{ flex: 1 }}>
                                {/* Name skeleton */}
                                <Box className="rounded bg-neutral-700 h-5 w-48 mb-1 animate-pulse" />
                                {/* Email skeleton */}
                                <Box className="rounded bg-neutral-700 h-4 w-56 animate-pulse" />
                            </Stack>
                        </Stack>

                        {/* Arrow icon skeleton */}
                        <Box className="rounded-full bg-neutral-700 h-8 w-8 animate-pulse" />
                    </ListItem>
                ))}
            </List>

            {/* Pagination skeleton */}
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
                <Box className="rounded bg-neutral-600 h-8 w-16 animate-pulse" />
                <Box className="rounded bg-neutral-600 h-8 w-12 animate-pulse" />
                <Box className="rounded bg-neutral-600 h-8 w-16 animate-pulse" />
            </Stack>
        </>
    );
}
