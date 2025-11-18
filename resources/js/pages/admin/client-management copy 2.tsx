import ApprovePopper from '@/components/client-management/components/approve-popper';
import CardPagination from '@/components/client-management/components/card-pagination';
import FullScreenImageModal from '@/components/client-management/components/fullscreen-image-modal';
import RejectModal from '@/components/client-management/components/reject-modal';
import SearchAutocomplete from '@/components/client-management/components/search-autocomplete';
import UserAccordionList from '@/components/client-management/components/user-accordion-list';
import UserListCard from '@/components/client-management/components/user-list-card';
import AppLayout from '@/layouts/app-layout';
import { PendingUser } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Box, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    pendingUsers: PendingUser[];
    rejectionReasons: { code: string; label: string }[];
}

const breadcrumbs = [
    {
        title: 'Client Management',
        href: '/admin/client-management',
    },
];

export default function ClientManagement({ pendingUsers, rejectionReasons }: Props) {
    // ... your state, handlers, memo hooks (unchanged) ...
    const [expanded, setExpanded] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [approvePopperAnchor, setApprovePopperAnchor] = useState<null | HTMLElement>(null);
    const [approvePopperUser, setApprovePopperUser] = useState<PendingUser | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [imageTitle, setImageTitle] = useState<string>('');
    const [modalImagesUser, setModalImagesUser] = useState<PendingUser | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const [rejectedSearch, setRejectedSearch] = useState('');
    const [pendingSearch, setPendingSearch] = useState('');
    const [registeredSearch, setRegisteredSearch] = useState('');

    const rejectedUsers = useMemo(() => pendingUsers?.filter((u: PendingUser) => u.status === 'rejected') || [], [pendingUsers]);
    const forApprovalUsers = useMemo(() => pendingUsers?.filter((u: PendingUser) => u.status === 'pending') || [], [pendingUsers]);
    const registeredUsers = useMemo(
        () => pendingUsers?.filter((u: PendingUser) => u.status !== 'pending' && u.status !== 'rejected') || [],
        [pendingUsers],
    );

    const filteredPendingUsers = useMemo(
        () => forApprovalUsers.filter((u: PendingUser) => u.name.toLowerCase().includes(pendingSearch.toLowerCase())),
        [forApprovalUsers, pendingSearch],
    );
    const filteredRejectedUsers = useMemo(
        () => rejectedUsers.filter((u: PendingUser) => u.name.toLowerCase().includes(rejectedSearch.toLowerCase())),
        [rejectedUsers, rejectedSearch],
    );
    const filteredRegisteredUsers = useMemo(
        () => registeredUsers.filter((u: PendingUser) => u.name.toLowerCase().includes(registeredSearch.toLowerCase())),
        [registeredUsers, registeredSearch],
    );

    const PAGE_SIZE = 10;
    const [pendingPage, setPendingPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);
    const [registeredPage, setRegisteredPage] = useState(1);

    useEffect(() => {
        setPendingPage(1);
    }, [pendingSearch, forApprovalUsers.length]);
    useEffect(() => {
        setRejectedPage(1);
    }, [rejectedSearch, rejectedUsers.length]);
    useEffect(() => {
        setRegisteredPage(1);
    }, [registeredSearch, registeredUsers.length]);

    const pendingTotalPages = Math.max(1, Math.ceil(filteredPendingUsers.length / PAGE_SIZE));
    const rejectedTotalPages = Math.max(1, Math.ceil(filteredRejectedUsers.length / PAGE_SIZE));
    const registeredTotalPages = Math.max(1, Math.ceil(filteredRegisteredUsers.length / PAGE_SIZE));

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

    const openFullScreenImage = (img: string, title: string) => {
        setFullScreenImage(img);
        setImageTitle(title);
    };
    const closeFullScreenImage = () => {
        setFullScreenImage(null);
        setImageTitle('');
        setModalImagesUser(null);
    };
    const handleApprove = (e: React.MouseEvent<HTMLElement>, user: PendingUser) => {
        setApprovePopperAnchor(e.currentTarget);
        setApprovePopperUser(user);
    };
    const handleRejectClick = (user: PendingUser) => {
        setSelectedUser(user);
        setShowRejectModal(true);
        setSelectedReasons([]);
    };

    const toggleReason = (reason: string) => {
        setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
    };

    const submitRejection = () => {
        if (!selectedUser || selectedReasons.length === 0) return;
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

    const userAccordionProps = {
        expanded,
        setExpanded,
        openFullScreenImage,
        handleApprove,
        handleRejectClick,
        isMobile: false,
        setModalImagesUser,
        processing,
        setFullScreenImage,
        setImageTitle,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client Management" />
            <Box sx={{ flexGrow: 1, width: '100vw', px: 0, mx: 0 }}>
                <Box
                    sx={{
                        display: 'grid',
                        width: '100%',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    }}
                >
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        {/* Header */}
                        <Box
                            sx={{
                                background: '#F57979',
                                borderRadius: 3,
                                minHeight: 145,
                                boxShadow: 3,
                                mb: { xs: 3, md: 5 },
                                width: '100%', // fill full width
                                px: 0, // no extra horizontal padding
                            }}
                        >
                            <Box sx={{ p: { xs: 3, md: 5 } }}>
                                <Typography
                                    component="h1"
                                    sx={{
                                        mb: 1,
                                        fontWeight: 800,
                                        fontSize: { xs: '2rem', sm: '2.2rem', md: '2.6rem' },
                                        color: '#FFF172',
                                        letterSpacing: '-.02em',
                                    }}
                                >
                                    Client Management
                                </Typography>
                                <Typography
                                    sx={{
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: { xs: 16, md: 18 },
                                        opacity: 0.92,
                                    }}
                                >
                                    Review and approve client registrations
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        {/* Registered Users card */}
                        <UserListCard
                            title="REGISTERED USERS"
                            titleColor="#F57979"
                            userCount={registeredUsers.length}
                        >
                            <SearchAutocomplete
                                options={registeredUsers.map((u: PendingUser) => u.name)}
                                value={registeredSearch}
                                onChange={setRegisteredSearch}
                                placeholder="Search registered"
                            />
                            <UserAccordionList
                                usersList={pagedRegisteredUsers}
                                groupTab={0}
                                {...userAccordionProps}
                                searchValue={registeredSearch}
                            />
                            <CardPagination count={registeredTotalPages} page={registeredPage} onChange={setRegisteredPage} />
                        </UserListCard>
                    </Box>
                    <Box>
                        {/* Pending Approval card */}
                        <UserListCard
                            title="PENDING APPROVAL"
                            titleColor="#F57979"
                            userCount={forApprovalUsers.length}
                        >
                            <SearchAutocomplete
                                options={forApprovalUsers.map((u: PendingUser) => u.name)}
                                value={pendingSearch}
                                onChange={setPendingSearch}
                                placeholder="Search pending"
                            />
                            <UserAccordionList
                                usersList={pagedPendingUsers}
                                groupTab={1}
                                {...userAccordionProps}
                                searchValue={pendingSearch}
                            />
                            <CardPagination count={pendingTotalPages} page={pendingPage} onChange={setPendingPage} />
                        </UserListCard>
                    </Box>
                    <Box>
                        {/* Rejected Users card */}
                        <UserListCard title="REJECTED USERS" titleColor="#4C92F1" userCount={rejectedUsers.length}>
                            <SearchAutocomplete
                                options={rejectedUsers.map((u: PendingUser) => u.name)}
                                value={rejectedSearch}
                                onChange={setRejectedSearch}
                                placeholder="Search rejected"
                            />
                            <UserAccordionList
                                usersList={pagedRejectedUsers}
                                groupTab={2}
                                {...userAccordionProps}
                                searchValue={rejectedSearch}
                            />
                            <CardPagination count={rejectedTotalPages} page={rejectedPage} onChange={setRejectedPage} />
                        </UserListCard>
                    </Box>
                </Box>
            </Box>

            {/* Modals – unchanged */}
            <ApprovePopper
                open={Boolean(approvePopperAnchor)}
                anchorEl={approvePopperAnchor}
                user={approvePopperUser}
                isMobile={false}
                processing={processing}
                onCancel={() => {
                    setApprovePopperAnchor(null);
                    setApprovePopperUser(null);
                }}
                onApprove={() => {
                    if (!approvePopperUser) return;
                    setProcessing(true);
                    router.post(
                        route('admin.client-management.approve', approvePopperUser.user_id),
                        {},
                        {
                            preserveScroll: true,
                            onFinish: () => {
                                setProcessing(false);
                                setApprovePopperAnchor(null);
                                setApprovePopperUser(null);
                            },
                        },
                    );
                }}
            />
            <FullScreenImageModal
                open={!!fullScreenImage}
                imageUrl={fullScreenImage}
                title={imageTitle}
                modalImagesUser={modalImagesUser}
                isMobile={false}
                onClose={closeFullScreenImage}
            />
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
        </AppLayout>
    );
}
