import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';
import { useInitials } from '@/hooks/use-initials';
import type { Client, RegistrationStatus } from '@/types/user';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Avatar, Box, IconButton, List, ListItem, Stack, Tab, Tabs, TextField, Typography, useMediaQuery } from '@mui/material';
import { CLIENT_LIST_PAGE_SIZE } from './skeletons';
import BoxHeader from '@/components/box-header';

type Props = {
    clients: Client[];
    onSelect?: (userId: number) => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchOptions?: string[];
    fullHeight?: boolean;
    enableStatusTabs?: boolean;
    statusTab?: RegistrationStatus;
    onStatusTabChange?: (value: RegistrationStatus) => void;
};

const ClientList: React.FC<Props> = ({
    clients,
    onSelect,
    searchValue = '',
    onSearchChange,
    searchOptions = [],
    fullHeight = false,
    enableStatusTabs = false,
    statusTab: controlledStatusTab,
    onStatusTabChange,
}) => {
    const tw = useMyTheme();
    const getInitials = useInitials();
    const isMobile = useMediaQuery('(max-width: 600px)');

    const [statusTabInternal, setStatusTabInternal] = useState<RegistrationStatus>('approved');
    const statusTab = controlledStatusTab ?? statusTabInternal;
    const [page, setPage] = useState(1);
    const pageSize = CLIENT_LIST_PAGE_SIZE;

    const list = useMemo(() => clients ?? [], [clients]);
    const listScrollRef = useRef<HTMLUListElement | null>(null);

    const statusCounts = useMemo(() => {
        return list.reduce(
            (acc, c) => {
                if (c.status === 'approved') acc.approved += 1;
                else if (c.status === 'pending') acc.pending += 1;
                else if (c.status === 'rejected') acc.rejected += 1;
                return acc;
            },
            { approved: 0, pending: 0, rejected: 0 },
        );
    }, [list]);

    const displayList = useMemo(() => {
        if (!enableStatusTabs) return list;
        return list.filter((c) => c.status === statusTab);
    }, [enableStatusTabs, list, statusTab]);

    const totalPages = Math.max(Math.ceil(displayList.length / pageSize), 1);
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    const paginated = useMemo(() => displayList.slice(start, start + pageSize), [displayList, start, pageSize]);

    useEffect(() => {
        if (page !== clampedPage) {
            setPage(clampedPage);
        }
    }, [clampedPage, page]);

    useEffect(() => {
        setPage(1);
    }, [searchValue, statusTab]);

    useEffect(() => {
        if (listScrollRef.current) {
            listScrollRef.current.scrollTop = 0;
        }
    }, [statusTab]);

    const handleStatusTabChange = (_: unknown, value: RegistrationStatus) => {
        if (!value) return;
        onStatusTabChange?.(value);
        if (!controlledStatusTab) {
            setStatusTabInternal(value);
        }
    };

    const avatarSrc = (c: Client) => {
        const raw = c.profile_picture_url ?? c.profile_picture_path ?? '';
        if (!raw) return undefined;
        // If already absolute or has storage prefix, use as-is
        if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/storage')) return raw;
        // Otherwise add /storage/ prefix
        return `/storage/${raw.replace(/^\/+/, '')}`;
    };

    return (
        <Stack
            spacing={isMobile ? 1.1 : 1.6}
            sx={fullHeight ? { flex: 1, minHeight: '100%', alignItems: 'stretch', justifyContent: 'flex-start' } : undefined}
        >
            <Box
                sx={{
                    borderRadius: 6,
                    bgcolor: tw.isDark ? '#171717' : '#FAFAFA',
                    p: 0,
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 1.5 : 2,
                }}
            >
                {enableStatusTabs ? (
                    <Tabs
                        value={statusTab}
                        onChange={handleStatusTabChange}
                        variant="fullWidth"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ mb: isMobile ? 0.5 : 1 }}
                    >
                        <Tab
                            value="approved"
                            label={
                                isMobile
                                    ? 'Approved'
                                    : `Approved (${statusCounts.approved})`
                            }
                        />
                        <Tab
                            value="pending"
                            label={
                                isMobile
                                    ? 'Pending'
                                    : `Pending (${statusCounts.pending})`
                            }
                        />
                        <Tab
                            value="rejected"
                            label={
                                isMobile
                                    ? 'Rejected'
                                    : `Rejected (${statusCounts.rejected})`
                            }
                        />
                    </Tabs>
                ) : null}

                {/* Search bar */}
                <Autocomplete
                    freeSolo
                    options={searchOptions.length ? searchOptions : list.map((c) => c.name)}
                    value={searchValue}
                    onInputChange={(_, value) => onSearchChange?.(value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SearchIcon fontSize="small" />
                                    Search clients
                                </Box>
                            }
                            size="small"
                        />
                    )}
                    sx={{ width: '100%' }}
                />

                {/* Client list */}
                {paginated.length === 0 ? (
                    <Box
                        sx={{
                            border: `1px dashed ${tw.isDark ? '#3a3a3a' : '#e5e5e5'}`,
                            borderRadius: 2,
                            p: isMobile ? 3 : 4,
                            minHeight: isMobile ? 200 : 300,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: 'text.secondary',
                            gap: isMobile ? 0.5 : 1,
                        }}
                    >
                        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
                            No clients found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Clients will appear here once they are fetched.
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ flex: fullHeight ? 1 : 'auto', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto', p: 0 }} ref={listScrollRef}>
                        {paginated.map((client) => (
                            <ListItem
                                key={client.user_id}
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
                                        bgcolor: tw.isDark ? '#2f2f2f' : '#F5F5F5'
                                    }
                                }}
                            >
                                <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: 'center' }}>
                                    {/* Avatar */}
                                    <Avatar
                                        src={avatarSrc(client)}
                                        alt={client.name}
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            bgcolor: tw.isDark ? '#3c3c3c' : '#e0e7ff',
                                            fontWeight: 700,
                                            color: tw.isDark ? 'white' : '#1e293b',
                                        }}
                                    >
                                        {getInitials(client.name)}
                                    </Avatar>

                                    {/* Client info */}
                                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} noWrap>
                                            {client.name}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: isMobile ? '0.75rem' : '0.875rem'
                                            }}
                                        >
                                            {client.email}
                                        </Typography>
                                    </Stack>
                                </Stack>

                                {/* Arrow icon */}
                                <IconButton
                                    size="small"
                                    onClick={() => onSelect?.(client.user_id)}
                                    sx={{
                                        width: isMobile ? 32 : 36,
                                        height: isMobile ? 32 : 36,
                                        borderRadius: '50%',
                                        border: '1px solid rgba(245,121,121,0.25)',
                                        bgcolor: 'rgba(245,121,121,0.12)',
                                        color: '#f57979',
                                        transition: 'all 120ms ease',
                                        '&:hover': {
                                            transform: 'scale(1.08)',
                                            bgcolor: 'rgba(245,121,121,0.2)',
                                        },
                                    }}
                                >
                                    <ArrowForwardIosIcon fontSize="inherit" />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Pagination */}
                {displayList.length > 0 && (
                    <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
                        <Box
                            component="button"
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={clampedPage <= 1}
                            style={{ cursor: clampedPage <= 1 ? 'not-allowed' : 'pointer' }}
                            sx={{
                                px: 2,
                                py: 0.6,
                                borderRadius: 1,
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                bgcolor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                                color: 'text.secondary',
                                fontWeight: 700,
                                opacity: clampedPage <= 1 ? 0.6 : 1,
                                fontSize: '0.875rem',
                            }}
                        >
                            Prev
                        </Box>
                        <Box
                            sx={{
                                px: 2,
                                py: 0.6,
                                borderRadius: 1,
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                bgcolor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                                color: 'text.secondary',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                            }}
                        >
                            {clampedPage} / {totalPages}
                        </Box>
                        <Box
                            component="button"
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={clampedPage >= totalPages}
                            style={{ cursor: clampedPage >= totalPages ? 'not-allowed' : 'pointer' }}
                            sx={{
                                px: 2,
                                py: 0.6,
                                borderRadius: 1,
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
                                bgcolor: tw.isDark ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
                                color: 'text.secondary',
                                fontWeight: 700,
                                opacity: clampedPage >= totalPages ? 0.6 : 1,
                                fontSize: '0.875rem',
                            }}
                        >
                            Next
                        </Box>
                    </Stack>
                )}
            </Box>
        </Stack>
    );
};

export default ClientList;
