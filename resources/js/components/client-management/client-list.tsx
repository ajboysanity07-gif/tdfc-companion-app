import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMyTheme } from '@/hooks/use-mytheme';
import { useInitials } from '@/hooks/use-initials';
import type { Client, RegistrationStatus } from '@/types/user';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Avatar, Box, IconButton, List, ListItem, Paper, Stack, Tab, Tabs, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CLIENT_LIST_PAGE_SIZE } from './client-list-skeleton';

type Props = {
    clients: Client[];
    onSelect?: (userId: number) => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchOptions?: string[];
    fullHeight?: boolean;
    enableStatusTabs?: boolean;
};

const ClientList: React.FC<Props> = ({
    clients,
    onSelect,
    searchValue = '',
    onSearchChange,
    searchOptions = [],
    fullHeight = false,
    enableStatusTabs = false,
}) => {
    const tw = useMyTheme();
    const getInitials = useInitials();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const cardBg = tw.isDark ? '#2f2f2f' : '#f7f7f7';
    const cardBorder = tw.isDark ? '#3a3a3a' : '#e5e5e5';

    const [statusTab, setStatusTab] = useState<RegistrationStatus>('approved');
    const [page, setPage] = useState(1);
    const pageSize = CLIENT_LIST_PAGE_SIZE;

    const list = useMemo(() => clients ?? [], [clients]);
    const listScrollRef = useRef<HTMLUListElement | null>(null);
    const listContainerRef = useRef<HTMLDivElement | null>(null);

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
        if (listContainerRef.current) {
            listContainerRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, [statusTab]);

    const avatarSrc = (c: Client) => {
        const raw = c.profile_picture_url ?? c.profile_picture_path ?? '';
        if (!raw) return undefined;
        // If backend returns relative storage path, prefix /storage/
        return raw.startsWith('http') || raw.startsWith('data:') ? raw : `/storage/${raw.replace(/^\/+/, '')}`;
    };

    return (
        <Stack
            spacing={isMobile ? 1.1 : 1.6}
            sx={fullHeight ? { flex: 1, minHeight: '100%', alignItems: 'stretch', justifyContent: 'flex-start' } : undefined}
        >
            {enableStatusTabs ? (
                <Tabs
                    value={statusTab}
                    onChange={(_, value) => setStatusTab(value)}
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

            <Box
                sx={{
                    p: isMobile ? 1 : 1.5,
                    borderRadius: 2,
                    bgcolor: tw.isDark ? '#262626' : 'rgba(0,0,0,0.04)',
                    border: tw.isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
                    flex: fullHeight ? 1 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 1 : 1.25,
                }}
                ref={listContainerRef}
            >
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
                    sx={{ minWidth: 220 }}
                />

                {paginated.length === 0 ? (
                    <Box
                        sx={{
                            border: `1px dashed ${cardBorder}`,
                            borderRadius: 2,
                            p: isMobile ? 2.5 : 4,
                            minHeight: fullHeight ? '100%' : isMobile ? '75%' : 360,
                            height: fullHeight ? '100%' : 'auto',
                            flexGrow: fullHeight ? 1 : 0,
                            width: '100%',
                            alignSelf: 'stretch',
                            maxWidth: '100%',
                            mx: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: 'text.secondary',
                            gap: isMobile ? 0.5 : 0.75,
                        }}
                    >
                        <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={800}>
                            No clients found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Clients will appear here once they are fetched.
                        </Typography>
                    </Box>
                ) : (
                    <List
                        disablePadding
                        sx={{
                            width: '100%',
                            mt: isMobile ? 0.25 : 0.5,
                            flexGrow: 0,
                            alignSelf: 'stretch',
                        }}
                        ref={listScrollRef}
                    >
                        {paginated.map((client) => (
                            <Paper
                                key={client.user_id}
                                elevation={2}
                                sx={{
                                    mb: isMobile ? 1 : 1.25,
                                    borderRadius: isMobile ? 2 : 2.5,
                                    overflow: 'hidden',
                                    bgcolor: cardBg,
                                    border: `1px solid ${cardBorder}`,
                                }}
                            >
                                <ListItem disableGutters sx={{ px: isMobile ? 1.5 : 2, py: isMobile ? 1 : 1.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={isMobile ? 1.25 : 1.5} sx={{ width: '100%' }}>
                                        <Avatar
                                            src={avatarSrc(client)}
                                            alt={client.name}
                                            sx={{
                                                width: isMobile ? 44 : 52,
                                                height: isMobile ? 44 : 52,
                                                bgcolor: tw.isDark ? '#3c3c3c' : '#e0e7ff',
                                                fontWeight: 700,
                                                color: tw.isDark ? 'white' : '#1e293b',
                                            }}
                                        >
                                            {getInitials(client.name)}
                                        </Avatar>

                                        <Typography
                                            variant={isMobile ? 'subtitle1' : 'h6'}
                                            fontWeight={800}
                                            noWrap
                                            sx={{ flex: 1, minWidth: 0 }}
                                        >
                                            {client.name}
                                        </Typography>

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
                                    </Stack>
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                )}
            </Box>
            {displayList.length > 0 ? (
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ pt: isMobile ? 0.75 : 1 }}>
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
                        }}
                    >
                        Next
                    </Box>
                </Stack>
            ) : null}
        </Stack>
    );
};

export default ClientList;
