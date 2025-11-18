import ApprovePopper from '@/components/client-management/components/approve-popper';
import FullScreenImageModal from '@/components/client-management/components/fullscreen-image-modal';
import RejectModal from '@/components/client-management/components/reject-modal';
import UserAccordionList from '@/components/client-management/components/user-accordion-list';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { PageProps, PendingUser } from '@/types';
import { Head, router } from '@inertiajs/react';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, Pagination, Tab, Tabs, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useMemo, useState } from 'react';

interface Props extends PageProps {
    pendingUsers: PendingUser[];
    rejectionReasons: { code: string; label: string }[];
}

export default function ClientManagement({ auth, pendingUsers, rejectionReasons }: Props) {
    // --- State management ---
    const [expanded, setExpanded] = useState<number | null>(null);
    const [tab, setTab] = useState(1);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

    // Approve popper
    const [approvePopperAnchor, setApprovePopperAnchor] = useState<null | HTMLElement>(null);
    const [approvePopperUser, setApprovePopperUser] = useState<PendingUser | null>(null);

    // Image Modal states
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [imageTitle, setImageTitle] = useState<string>('');
    const [modalImagesUser, setModalImagesUser] = useState<PendingUser | null>(null);

    // Reject Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    // --- Properly memoize filtered users per ESLint warning ---
    const rejectedUsers = useMemo(() => pendingUsers?.filter((u) => u.status === 'rejected') || [], [pendingUsers]);
    const forApprovalUsers = useMemo(() => pendingUsers?.filter((u) => u.status === 'pending') || [], [pendingUsers]);
    const registeredUsers = useMemo(() => pendingUsers?.filter((u) => u.status !== 'pending' && u.status !== 'rejected') || [], [pendingUsers]);

    // Search state and filtering
    const [rejectedSearch, setRejectedSearch] = useState('');
    const [pendingSearch, setPendingSearch] = useState('');
    const [registeredSearch, setRegisteredSearch] = useState('');

    const filteredPendingUsers = useMemo(
        () => forApprovalUsers.filter((u) => u.name.toLowerCase().includes(pendingSearch.toLowerCase())),
        [forApprovalUsers, pendingSearch],
    );
    const filteredRejectedUsers = useMemo(
        () => rejectedUsers.filter((u) => u.name.toLowerCase().includes(rejectedSearch.toLowerCase())),
        [rejectedUsers, rejectedSearch],
    );
    const filteredRegisteredUsers = useMemo(
        () => registeredUsers.filter((u) => u.name.toLowerCase().includes(registeredSearch.toLowerCase())),
        [registeredUsers, registeredSearch],
    );

    // --- Pagination (10 rows per list) ---
    const PAGE_SIZE = 10;

    // Individual page indices for each list
    const [pendingPage, setPendingPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);
    const [registeredPage, setRegisteredPage] = useState(1);

    // Reset page to 1 whenever filters change to avoid empty pages
    useEffect(() => {
        setPendingPage(1);
    }, [pendingSearch, forApprovalUsers.length]);
    useEffect(() => {
        setRejectedPage(1);
    }, [rejectedSearch, rejectedUsers.length]);
    useEffect(() => {
        setRegisteredPage(1);
    }, [registeredSearch, registeredUsers.length]);

    // Compute total pages
    const pendingTotalPages = Math.max(1, Math.ceil(filteredPendingUsers.length / PAGE_SIZE));
    const rejectedTotalPages = Math.max(1, Math.ceil(filteredRejectedUsers.length / PAGE_SIZE));
    const registeredTotalPages = Math.max(1, Math.ceil(filteredRegisteredUsers.length / PAGE_SIZE));

    // Current page slices
    const pagedPendingUsers = useMemo(() => {
        const start = (pendingPage - 1) * PAGE_SIZE;
        return filteredPendingUsers.slice(start, start + PAGE_SIZE);
    }, [filteredPendingUsers, pendingPage]);
    const pagedRejectedUsers = useMemo(() => {
        const start = (rejectedPage - 1) * PAGE_SIZE;
        return filteredRejectedUsers.slice(start, start + PAGE_SIZE);
    }, [filteredRejectedUsers, rejectedPage]);
    const pagedRegisteredUsers = useMemo(() => {
        const start = (registeredPage - 1) * PAGE_SIZE;
        return filteredRegisteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredRegisteredUsers, registeredPage]);

    // --- Main handlers (passed as props to children below) ---
    const openFullScreenImage = (imageUrl: string, title: string) => {
        setFullScreenImage(imageUrl);
        setImageTitle(title);
    };
    const closeFullScreenImage = () => {
        setFullScreenImage(null);
        setImageTitle('');
        setModalImagesUser(null);
    };

    const handleApprove = (event: React.MouseEvent<HTMLElement>, user: PendingUser) => {
        setApprovePopperAnchor(event.currentTarget);
        setApprovePopperUser(user);
    };
    const closeApprovePopper = () => {
        setApprovePopperAnchor(null);
        setApprovePopperUser(null);
    };
    const confirmApprove = () => {
        if (!approvePopperUser) return;
        setProcessing(true);
        router.post(
            route('admin.client-management.approve', approvePopperUser.user_id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    closeApprovePopper();
                },
            },
        );
    };

    const handleRejectClick = (user: PendingUser) => {
        setSelectedUser(user);
        setSelectedReasons([]);
        setShowRejectModal(true);
    };

    const toggleReason = (reason: string) => {
        setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
    };

    const submitRejection = () => {
        if (!selectedUser || selectedReasons.length === 0) {
            alert('Please select at least one rejection reason');
            return;
        }
        setProcessing(true);
        router.post(
            route('admin.client-management.reject', selectedUser.user_id),
            { reasons: selectedReasons },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRejectModal(false);
                    setSelectedUser(null);
                    setSelectedReasons([]);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    // Props for UserAccordionList
    const userAccordionProps = {
        expanded,
        setExpanded,
        openFullScreenImage,
        handleApprove,
        handleRejectClick,
        isMobile,
        setModalImagesUser,
        processing,
        setFullScreenImage,
        setImageTitle,
    };

    return (
        <>
            {isMobile ? (
                <AuthenticatedLayout user={auth.user}>
                    <Head title="Client Management - Admin" />
                    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f8' }}>
                        <Box sx={{ background: '#f57979', px: 0, pt: { xs: 3, sm: 5 }, pb: { xs: 10, sm: 14 }, zIndex: 1, position: 'relative' }}>
                            <Typography
                                sx={{
                                    color: '#f7dd74',
                                    fontWeight: 700,
                                    fontSize: '2.3rem',
                                    padding: '1.2rem 1.5rem 0.3rem 1.5rem',
                                    fontFamily: 'inherit',
                                    letterSpacing: '-1px',
                                }}
                            >
                                Client Management
                            </Typography>
                            <Typography
                                sx={{
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: 400,
                                    paddingLeft: '1.5rem',
                                    paddingBottom: 2,
                                    margin: 0,
                                    opacity: 0.86,
                                }}
                            >
                                Review and approve client registrations
                            </Typography>
                        </Box>

                        <Box sx={{ px: { xs: 2, sm: 5 }, maxWidth: 540, mx: 'auto', mt: { xs: -7, sm: -9 }, zIndex: 2, position: 'relative' }}>
                            <Box
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 4,
                                    boxShadow: 3,
                                    px: { xs: 4, sm: 8 },
                                    py: { xs: 2, sm: 2.5 },
                                    minHeight: 480,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Tabs
                                    value={tab}
                                    onChange={(_, v) => setTab(v)}
                                    aria-label="user status tabs"
                                    variant="fullWidth"
                                    sx={{
                                        minHeight: 42,
                                        mb: 0,
                                        '& .MuiTabs-indicator': { height: 3, borderRadius: '2px', backgroundColor: '#F57979' },
                                        '& .MuiTab-root': { fontWeight: 700, fontSize: '13px', py: 0.8, textTransform: 'none', minHeight: '32px' },
                                        '& .Mui-selected': { color: '#F57979' },
                                    }}
                                >
                                    <Tab label={`Registered (${registeredUsers.length})`} />
                                    <Tab label={`Pending Approval (${forApprovalUsers.length})`} />
                                    <Tab label={`Rejected (${rejectedUsers.length})`} />
                                </Tabs>

                                {tab === 0 && (
                                    <>
                                        <Autocomplete
                                            options={registeredUsers.map((u) => u.name)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={null}
                                                    placeholder="Search registered"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        mb: 2,
                                                        mt: 2,
                                                        background: '#fff',
                                                        borderRadius: 2,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '10px',
                                                            paddingLeft: 1,
                                                            paddingRight: 1,
                                                            background: '#fff',
                                                            boxShadow: 'none',
                                                        },
                                                        '& input': {
                                                            fontSize: '1.03rem',
                                                            fontWeight: 500,
                                                            color: '#21243b',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#e2e7ef',
                                                        },
                                                        '& input:-webkit-autofill': {
                                                            WebkitBoxShadow: '0 0 0 100px #fff inset',
                                                            WebkitTextFillColor: '#21243b',
                                                        },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon sx={{ color: '#727a8a', fontSize: 22 }} />
                                                            </InputAdornment>
                                                        ),
                                                        disableUnderline: false,
                                                    }}
                                                />
                                            )}
                                            onInputChange={(_, value) => setRegisteredSearch(value)}
                                            freeSolo
                                        />
                                        <UserAccordionList
                                            usersList={pagedRegisteredUsers}
                                            groupTab={0}
                                            {...userAccordionProps}
                                            searchValue={registeredSearch}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: 26, // or adjust for your theme spacing (px: { xs: 4, sm: 8 })
                                                bottom: 20, // adjust as needed so it doesn’t overlap shadow or border
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                                // No width!
                                                zIndex: 2,
                                            }}
                                        >
                                            <Pagination
                                                size="small"
                                                color="primary"
                                                count={registeredTotalPages}
                                                page={registeredPage}
                                                onChange={(_, p) => setRegisteredPage(p)}
                                                siblingCount={0}
                                                boundaryCount={1}
                                            />
                                        </Box>
                                    </>
                                )}

                                {tab === 1 && (
                                    <>
                                        <Autocomplete
                                            options={forApprovalUsers.map((u) => u.name)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={null}
                                                    placeholder="Search pending"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        mb: 2,
                                                        mt: 2,
                                                        background: '#fff',
                                                        borderRadius: 2,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '10px',
                                                            paddingLeft: 1,
                                                            paddingRight: 1,
                                                            background: '#fff',
                                                            boxShadow: 'none',
                                                        },
                                                        '& input': {
                                                            fontSize: '1.03rem',
                                                            fontWeight: 500,
                                                            color: '#21243b',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#e2e7ef',
                                                        },
                                                        '& input:-webkit-autofill': {
                                                            WebkitBoxShadow: '0 0 0 100px #fff inset',
                                                            WebkitTextFillColor: '#21243b',
                                                        },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon sx={{ color: '#727a8a', fontSize: 22 }} />
                                                            </InputAdornment>
                                                        ),
                                                        disableUnderline: false,
                                                    }}
                                                />
                                            )}
                                            onInputChange={(_, value) => setPendingSearch(value)}
                                            freeSolo
                                        />
                                        <UserAccordionList
                                            usersList={pagedPendingUsers}
                                            groupTab={1}
                                            {...userAccordionProps}
                                            searchValue={pendingSearch}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: 26, // or adjust for your theme spacing (px: { xs: 4, sm: 8 })
                                                bottom: 20, // adjust as needed so it doesn’t overlap shadow or border
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                                // No width!
                                                zIndex: 2,
                                            }}
                                        >
                                            <Pagination
                                                size="small"
                                                color="primary"
                                                count={pendingTotalPages}
                                                page={pendingPage}
                                                onChange={(_, p) => setPendingPage(p)}
                                                siblingCount={0}
                                                boundaryCount={1}
                                            />
                                        </Box>
                                    </>
                                )}

                                {tab === 2 && (
                                    <>
                                        <Autocomplete
                                            options={rejectedUsers.map((u) => u.name)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={null}
                                                    placeholder="Search rejected"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        mb: 2,
                                                        mt: 2,
                                                        background: '#fff',
                                                        borderRadius: 2,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '10px',
                                                            paddingLeft: 1,
                                                            paddingRight: 1,
                                                            background: '#fff',
                                                            boxShadow: 'none',
                                                        },
                                                        '& input': {
                                                            fontSize: '1.03rem',
                                                            fontWeight: 500,
                                                            color: '#21243b',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#e2e7ef',
                                                        },
                                                        '& input:-webkit-autofill': {
                                                            WebkitBoxShadow: '0 0 0 100px #fff inset',
                                                            WebkitTextFillColor: '#21243b',
                                                        },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon sx={{ color: '#727a8a', fontSize: 22 }} />
                                                            </InputAdornment>
                                                        ),
                                                        disableUnderline: false,
                                                    }}
                                                />
                                            )}
                                            onInputChange={(_, value) => setRejectedSearch(value)}
                                            freeSolo
                                        />
                                        <UserAccordionList
                                            usersList={pagedRejectedUsers}
                                            groupTab={2}
                                            {...userAccordionProps}
                                            searchValue={rejectedSearch}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: 26, // or adjust for your theme spacing (px: { xs: 4, sm: 8 })
                                                bottom: 20, // adjust as needed so it doesn’t overlap shadow or border
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                                // No width!
                                                zIndex: 2,
                                            }}
                                        >
                                            <Pagination
                                                size="small"
                                                color="primary"
                                                count={rejectedTotalPages}
                                                page={rejectedPage}
                                                onChange={(_, p) => setRejectedPage(p)}
                                                siblingCount={0}
                                                boundaryCount={1}
                                            />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </AuthenticatedLayout>
            ) : (
                <AuthenticatedLayout user={auth.user}>
                    <Head title="Client Management - Admin" />
                    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f8' }}>
                        <Box sx={{ background: '#f57979', px: 0, pt: 7, pb: 7, zIndex: 1, position: 'relative' }}>
                            <Box sx={{ maxWidth: '100vw', mx: 'auto', px: 4 }}>
                                <Typography sx={{ color: '#f7dd74', fontWeight: 800, fontSize: '2.7rem', px: 1, pb: 0.5, letterSpacing: '-1px' }}>
                                    Client Management
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.93)', fontSize: '1.14rem', pb: 1, px: 1, maxWidth: '800px' }}>
                                    Review and approve client registrations • {pendingUsers.length} total applications
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 1440,
                                mx: 'auto',
                                px: { xs: 1, sm: 3, md: 4 },
                                py: { xs: 2, md: 6 },
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                gap: { xs: 3, md: 5 },
                                alignItems: 'stretch',
                                minHeight: 400,
                            }}
                        >
                            {/* Pending Approval Card */}
                            <Box
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 5,
                                    boxShadow: '0 8px 32px 0 rgba(245,121,121,0.10)',
                                    px: { xs: 3, sm: 5, md: 6 },
                                    py: { xs: 3, md: 6 },
                                    minHeight: 340,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '0 16px 48px 0 rgba(245,121,121,0.18)' },
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#f57979',
                                        fontWeight: 800,
                                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        mb: 1.5,
                                        px: 0.5,
                                    }}
                                >
                                    Pending Approval ({forApprovalUsers.length})
                                </Typography>
                                <Autocomplete
                                    options={forApprovalUsers.map((u) => u.name)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={null}
                                            placeholder="Search pending"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                mb: 2,
                                                mt: 2,
                                                background: '#fff',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    paddingLeft: 1,
                                                    paddingRight: 1,
                                                    background: '#fff',
                                                    boxShadow: 'none',
                                                },
                                                '& input': {
                                                    fontSize: '1.03rem',
                                                    fontWeight: 500,
                                                    color: '#21243b',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#e2e7ef',
                                                },
                                                '& input:-webkit-autofill': {
                                                    WebkitBoxShadow: '0 0 0 100px #fff inset',
                                                    WebkitTextFillColor: '#21243b',
                                                },
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: '#727a8a', fontSize: 22 }} />
                                                    </InputAdornment>
                                                ),
                                                disableUnderline: false,
                                            }}
                                        />
                                    )}
                                    onInputChange={(_, value) => setPendingSearch(value)}
                                    freeSolo
                                />
                                <UserAccordionList usersList={pagedPendingUsers} groupTab={1} {...userAccordionProps} searchValue={pendingSearch} />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 26, // or adjust for your theme spacing (px: { xs: 4, sm: 8 })
                                        bottom: 20, // adjust as needed so it doesn’t overlap shadow or border
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        // No width!
                                        zIndex: 2,
                                    }}
                                >
                                    <Pagination
                                        size="small"
                                        color="primary"
                                        count={pendingTotalPages}
                                        page={pendingPage}
                                        onChange={(_, p) => setPendingPage(p)}
                                        siblingCount={0}
                                        boundaryCount={1}
                                    />
                                </Box>
                            </Box>

                            {/* Rejected Users Card */}
                            <Box
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 5,
                                    boxShadow: '0 8px 32px 0 rgba(100,150,220,0.11)',
                                    px: { xs: 3, sm: 5, md: 6 },
                                    py: { xs: 3, md: 6 },
                                    minHeight: 340,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '0 16px 48px 0 rgba(100,150,220,0.17)' },
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#4c92f1',
                                        fontWeight: 800,
                                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        mb: 1.5,
                                        px: 0.5,
                                    }}
                                >
                                    Rejected Users ({rejectedUsers.length})
                                </Typography>
                                <Autocomplete
                                    options={rejectedUsers.map((u) => u.name)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={null}
                                            placeholder="Search rejected"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                mb: 2,
                                                mt: 2,
                                                background: '#fff',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    paddingLeft: 1,
                                                    paddingRight: 1,
                                                    background: '#fff',
                                                    boxShadow: 'none',
                                                },
                                                '& input': {
                                                    fontSize: '1.03rem',
                                                    fontWeight: 500,
                                                    color: '#21243b',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#e2e7ef',
                                                },
                                                '& input:-webkit-autofill': {
                                                    WebkitBoxShadow: '0 0 0 100px #fff inset',
                                                    WebkitTextFillColor: '#21243b',
                                                },
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: '#727a8a', fontSize: 22 }} />
                                                    </InputAdornment>
                                                ),
                                                disableUnderline: false,
                                            }}
                                        />
                                    )}
                                    onInputChange={(_, value) => setRejectedSearch(value)}
                                    freeSolo
                                />
                                <UserAccordionList usersList={pagedRejectedUsers} groupTab={2} {...userAccordionProps} searchValue={rejectedSearch} />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 26, // or adjust for your theme spacing (px: { xs: 4, sm: 8 })
                                        bottom: 20, // adjust as needed so it doesn’t overlap shadow or border
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        // No width!
                                        zIndex: 2,
                                    }}
                                >
                                    <Pagination
                                        size="small"
                                        color="primary"
                                        count={rejectedTotalPages}
                                        page={rejectedPage}
                                        onChange={(_, p) => setRejectedPage(p)}
                                        siblingCount={0}
                                        boundaryCount={1}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Registered Users Full-Width Card */}
                        <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', px: { xs: 1, sm: 3, md: 4 }, pt: 3 }}>
                            <Box
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 5,
                                    boxShadow: '0 8px 32px 0 rgba(245,121,121,0.10)',
                                    px: { xs: 3, sm: 5, md: 6 },
                                    py: { xs: 3, md: 6 },
                                    minHeight: 340,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '0 16px 48px 0 rgba(245,121,121,0.18)' },
                                    position: 'relative',
                                    overflow: 'hidden',
                                    mt: 5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#f57979',
                                        fontWeight: 800,
                                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        mb: 1.5,
                                        px: 0.5,
                                    }}
                                >
                                    Registered Users ({registeredUsers.length})
                                </Typography>
                                <Autocomplete
                                    options={registeredUsers.map((u) => u.name)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={null}
                                            placeholder="Search registered"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                mb: 2,
                                                mt: 2,
                                                background: '#fff',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '10px',
                                                    paddingLeft: 1,
                                                    paddingRight: 1,
                                                    background: '#fff',
                                                    boxShadow: 'none',
                                                },
                                                '& input': {
                                                    fontSize: '1.03rem',
                                                    fontWeight: 500,
                                                    color: '#21243b',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#e2e7ef',
                                                },
                                                '& input:-webkit-autofill': {
                                                    WebkitBoxShadow: '0 0 0 100px #fff inset',
                                                    WebkitTextFillColor: '#21243b',
                                                },
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: '#727a8a', fontSize: 22 }} />
                                                    </InputAdornment>
                                                ),
                                                disableUnderline: false,
                                            }}
                                        />
                                    )}
                                    onInputChange={(_, value) => setRegisteredSearch(value)}
                                    freeSolo
                                />
                                <UserAccordionList
                                    usersList={pagedRegisteredUsers}
                                    groupTab={0}
                                    {...userAccordionProps}
                                    searchValue={registeredSearch}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 26, // or adjust for your theme spacing (px: { xs: 4, sm: 8 })
                                        bottom: 20, // adjust as needed so it doesn’t overlap shadow or border
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        // No width!
                                        zIndex: 2,
                                    }}
                                >
                                    <Pagination
                                        size="small"
                                        color="primary"
                                        count={registeredTotalPages}
                                        page={registeredPage}
                                        onChange={(_, p) => setRegisteredPage(p)}
                                        siblingCount={0}
                                        boundaryCount={1}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </AuthenticatedLayout>
            )}

            {/* --- Popper Approve Confirmation --- */}
            <ApprovePopper
                open={Boolean(approvePopperAnchor)}
                anchorEl={approvePopperAnchor}
                user={approvePopperUser}
                isMobile={isMobile}
                processing={processing}
                onCancel={() => {
                    setApprovePopperAnchor(null);
                    setApprovePopperUser(null);
                }}
                onApprove={confirmApprove}
            />

            {/* --- Document Full Screen Modal --- */}
            <FullScreenImageModal
                open={!!fullScreenImage}
                imageUrl={fullScreenImage}
                title={imageTitle}
                modalImagesUser={modalImagesUser}
                isMobile={isMobile}
                onClose={closeFullScreenImage}
            />

            {/* --- Reject Modal --- */}
            <RejectModal
                open={showRejectModal && !!selectedUser}
                user={selectedUser}
                rejectionReasons={rejectionReasons}
                selectedReasons={selectedReasons}
                processing={processing}
                onClose={() => setShowRejectModal(false)}
                onToggleReason={toggleReason}
                onSubmit={submitRejection}
            />
        </>
    );
}
