import ApprovePopper from '@/components/client-management/components/approve-popper';
import CardPagination from '@/components/client-management/components/card-pagination';
import FullScreenImageModal from '@/components/client-management/components/fullscreen-image-modal';
import MobileUserTabs from '@/components/client-management/components/mobile-user-tabs';
import RejectModal from '@/components/client-management/components/reject-modal';
import SearchAutocomplete from '@/components/client-management/components/search-autocomplete';
import UserAccordionList from '@/components/client-management/components/user-accordion-list';
import UserListCard from '@/components/client-management/components/user-list-card';
import { useIsMobileTabs } from '@/hooks/use-isMobile-tabs';
import AppLayout from '@/layouts/app-layout';
import { PendingUser } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    pendingUsers: PendingUser[];
    rejectionReasons: { code: string; label: string }[];
}

const breadcrumbs = [{ title: 'Client Management', href: '/admin/client-management' }];

export default function ClientManagement({ pendingUsers, rejectionReasons }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [expandedColumn, setExpandedColumn] = useState<number | null>(null);
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

    // Filter users by status
    const rejectedUsers = useMemo(() => pendingUsers?.filter((u: PendingUser) => u.status === 'rejected') || [], [pendingUsers]);
    const forApprovalUsers = useMemo(() => pendingUsers?.filter((u: PendingUser) => u.status === 'pending') || [], [pendingUsers]);
    const registeredUsers = useMemo(() => pendingUsers?.filter((u: PendingUser) => u.status === 'approved') || [], [pendingUsers]);

    // Filter by search term
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

    // Reset page when search or data changes
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

    // Paginate data
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
            route('admin.client-management.reject', selectedUser.user_id), // ✅ FIXED: Updated route name
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

    const isMobileOrTablet = useIsMobileTabs();

    // Accordion props with additional columnIndex logic
    const userAccordionProps = (columnIndex: number) => ({
        expanded,
        setExpanded,
        openFullScreenImage,
        handleApprove,
        handleRejectClick,
        isMobile: isMobileOrTablet,
        setModalImagesUser,
        processing,
        setFullScreenImage,
        setImageTitle,
        columnIndex,
        expandedColumn,
        setExpandedColumn,
    });

    // Apple-style separator: ultra-light in both themes
    function appleSeparator() {
        return {
            margin: 0,
            padding: 0,
            width: '92%',
            height: '1.5px',
            background:
                typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'rgba(84,84,88,0.24)' // Lighter for dark mode
                    : 'rgba(60,60,67,0.14)', // Very light for light mode
            borderRadius: '2px',
            alignSelf: 'center',
            marginTop: '0.5rem',
        };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Client Management" />
            <div
                className="rounded- flex flex-1 flex-col gap-4 overflow-x-auto bg-[#FAFAFA] p-4 transition-colors duration-300 dark:bg-neutral-900"
                style={{ minHeight: '100vh' }}
            >
                {/* HEADER */}
                <div className="relative mb-6 h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
                    <div className="relative z-10 p-6">
                        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">Client Management</h1>
                        <div className="text-[1.08rem] font-medium text-white opacity-90">Review and approve client registrations</div>
                    </div>
                </div>

                {/* MOBILE/TABLET Tabs UI */}
                {isMobileOrTablet ? (
                    <MobileUserTabs
                        registeredUsers={registeredUsers}
                        pagedRegisteredUsers={pagedRegisteredUsers}
                        registeredSearch={registeredSearch}
                        setRegisteredSearch={setRegisteredSearch}
                        registeredTotalPages={registeredTotalPages}
                        registeredPage={registeredPage}
                        setRegisteredPage={setRegisteredPage}
                        forApprovalUsers={forApprovalUsers}
                        pagedPendingUsers={pagedPendingUsers}
                        pendingSearch={pendingSearch}
                        setPendingSearch={setPendingSearch}
                        pendingTotalPages={pendingTotalPages}
                        pendingPage={pendingPage}
                        setPendingPage={setPendingPage}
                        rejectedUsers={rejectedUsers}
                        pagedRejectedUsers={pagedRejectedUsers}
                        rejectedSearch={rejectedSearch}
                        setRejectedSearch={setRejectedSearch}
                        rejectedTotalPages={rejectedTotalPages}
                        rejectedPage={rejectedPage}
                        setRejectedPage={setRejectedPage}
                        userAccordionProps={userAccordionProps}
                    />
                ) : (
                    <div className="flex w-full min-w-0 flex-row gap-8">
                        {/* Registered Users (index 0) */}
                        <div className="relative flex min-h-[800px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl shadow-md transition-colors duration-300">
                            <UserListCard
                                title="REGISTERED USERS"
                                titleColor="#F57979"
                                userCount={registeredUsers.length}
                                className="flex h-full flex-col"
                            >
                                <SearchAutocomplete
                                    options={registeredUsers.map((u: PendingUser) => u.name)}
                                    value={registeredSearch}
                                    onChange={setRegisteredSearch}
                                    placeholder="Search registered"
                                />
                                <div className="hide-scrollbar flex-1 overflow-y-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <UserAccordionList
                                        usersList={pagedRegisteredUsers}
                                        groupTab={0}
                                        {...userAccordionProps(0)}
                                        searchValue={registeredSearch}
                                    />
                                </div>
                                <div style={appleSeparator()} />
                                <div className="mt-auto flex justify-end pt-2 pr-4 pb-0">
                                    <CardPagination count={registeredTotalPages} page={registeredPage} onChange={setRegisteredPage} />
                                </div>
                            </UserListCard>
                        </div>

                        {/* Pending Approval (index 1) */}
                        <div className="relative flex min-h-[800px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl shadow-md transition-colors duration-300">
                            <UserListCard
                                title="PENDING APPROVAL"
                                titleColor="#F57979"
                                userCount={forApprovalUsers.length}
                                className="flex h-full flex-col"
                            >
                                <SearchAutocomplete
                                    options={forApprovalUsers.map((u: PendingUser) => u.name)}
                                    value={pendingSearch}
                                    onChange={setPendingSearch}
                                    placeholder="Search pending"
                                />
                                <div className="hide-scrollbar flex-1 overflow-y-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <UserAccordionList
                                        usersList={pagedPendingUsers}
                                        groupTab={1}
                                        {...userAccordionProps(1)}
                                        searchValue={pendingSearch}
                                    />
                                </div>
                                <div style={appleSeparator()} />
                                <div className="mt-auto flex justify-end pt-2 pr-4 pb-0">
                                    <CardPagination count={pendingTotalPages} page={pendingPage} onChange={setPendingPage} />
                                </div>
                            </UserListCard>
                        </div>

                        {/* Rejected Users (index 2) */}
                        <div className="relative flex min-h-[800px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl shadow-md transition-colors duration-300">
                            <UserListCard
                                title="REJECTED USERS"
                                titleColor="#4C92F1"
                                userCount={rejectedUsers.length}
                                className="flex h-full flex-col"
                            >
                                <SearchAutocomplete
                                    options={rejectedUsers.map((u: PendingUser) => u.name)}
                                    value={rejectedSearch}
                                    onChange={setRejectedSearch}
                                    placeholder="Search rejected"
                                />
                                <div className="hide-scrollbar flex-1 overflow-y-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    <UserAccordionList
                                        usersList={pagedRejectedUsers}
                                        groupTab={2}
                                        {...userAccordionProps(2)}
                                        searchValue={rejectedSearch}
                                    />
                                </div>
                                <div style={appleSeparator()} />
                                <div className="mt-auto flex justify-end pt-2 pr-4 pb-0">
                                    <CardPagination count={rejectedTotalPages} page={rejectedPage} onChange={setRejectedPage} />
                                </div>
                            </UserListCard>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals (unchanged) */}
            <ApprovePopper
                open={Boolean(approvePopperAnchor)}
                anchorEl={approvePopperAnchor}
                user={approvePopperUser}
                isMobile={isMobileOrTablet}
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
                isMobile={isMobileOrTablet}
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
