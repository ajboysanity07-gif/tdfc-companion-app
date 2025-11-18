import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import type { PendingUser } from '@/types';
import { useIsMobileTabs } from '@/hooks/use-isMobile-tabs';
import type {
    DesktopColumnConfig,
    UserAccordionInjectedProps,
} from '@/components/client-management/components/desktop-user-columns';

const PAGE_SIZE = 10;

export function useClientManagement(pendingUsers: PendingUser[]) {
    const isMobileOrTablet = useIsMobileTabs();
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

    const rejectedUsers = useMemo(
        () => pendingUsers?.filter((u: PendingUser) => u.status === 'rejected') || [],
        [pendingUsers],
    );
    const forApprovalUsers = useMemo(
        () => pendingUsers?.filter((u: PendingUser) => u.status === 'pending') || [],
        [pendingUsers],
    );
    const registeredUsers = useMemo(
        () => pendingUsers?.filter((u: PendingUser) => u.status === 'approved') || [],
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

    const openFullScreenImage = useCallback((img: string, title: string) => {
        setFullScreenImage(img);
        setImageTitle(title);
    }, []);

    const closeFullScreenImage = useCallback(() => {
        setFullScreenImage(null);
        setImageTitle('');
        setModalImagesUser(null);
    }, []);

    const handleApprove = useCallback((event: React.MouseEvent<HTMLElement>, user: PendingUser) => {
        setApprovePopperAnchor(event.currentTarget);
        setApprovePopperUser(user);
    }, []);

    const handleRejectClick = useCallback((user: PendingUser) => {
        setSelectedUser(user);
        setShowRejectModal(true);
        setSelectedReasons([]);
    }, []);

    const toggleReason = useCallback((reason: string) => {
        setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
    }, []);

    const submitRejection = useCallback(() => {
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
    }, [selectedReasons, selectedUser]);

    const submitApproval = useCallback(() => {
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
    }, [approvePopperUser]);

    const userAccordionProps = useCallback(
        (columnIndex: number): UserAccordionInjectedProps => ({
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
        }),
        [
            expanded,
            expandedColumn,
            handleApprove,
            handleRejectClick,
            isMobileOrTablet,
            openFullScreenImage,
            processing,
        ],
    );

    const desktopColumns = useMemo<DesktopColumnConfig[]>(
        () => [
            {
                key: 'registered',
                title: 'REGISTERED USERS',
                titleColor: '#F57979',
                userCount: registeredUsers.length,
                searchOptions: registeredUsers.map((u: PendingUser) => u.name),
                searchValue: registeredSearch,
                setSearch: setRegisteredSearch,
                pagedUsers: pagedRegisteredUsers,
                totalPages: registeredTotalPages,
                page: registeredPage,
                setPage: setRegisteredPage,
                groupTab: 0,
                columnIndex: 0,
            },
            {
                key: 'pending',
                title: 'PENDING APPROVAL',
                titleColor: '#F57979',
                userCount: forApprovalUsers.length,
                searchOptions: forApprovalUsers.map((u: PendingUser) => u.name),
                searchValue: pendingSearch,
                setSearch: setPendingSearch,
                pagedUsers: pagedPendingUsers,
                totalPages: pendingTotalPages,
                page: pendingPage,
                setPage: setPendingPage,
                groupTab: 1,
                columnIndex: 1,
            },
            {
                key: 'rejected',
                title: 'REJECTED USERS',
                titleColor: '#4C92F1',
                userCount: rejectedUsers.length,
                searchOptions: rejectedUsers.map((u: PendingUser) => u.name),
                searchValue: rejectedSearch,
                setSearch: setRejectedSearch,
                pagedUsers: pagedRejectedUsers,
                totalPages: rejectedTotalPages,
                page: rejectedPage,
                setPage: setRejectedPage,
                groupTab: 2,
                columnIndex: 2,
            },
        ],
        [
            forApprovalUsers,
            pagedPendingUsers,
            pagedRegisteredUsers,
            pagedRejectedUsers,
            pendingPage,
            pendingSearch,
            pendingTotalPages,
            rejectedPage,
            rejectedSearch,
            rejectedTotalPages,
            rejectedUsers,
            registeredPage,
            registeredSearch,
            registeredTotalPages,
            registeredUsers,
            setPendingPage,
            setPendingSearch,
            setRejectedPage,
            setRejectedSearch,
            setRegisteredPage,
            setRegisteredSearch,
        ],
    );

    return {
        isMobileOrTablet,
        expanded,
        setExpanded,
        expandedColumn,
        setExpandedColumn,
        selectedUser,
        setSelectedUser,
        approvePopperAnchor,
        setApprovePopperAnchor,
        approvePopperUser,
        setApprovePopperUser,
        fullScreenImage,
        imageTitle,
        modalImagesUser,
        showRejectModal,
        setShowRejectModal,
        selectedReasons,
        processing,
        rejectedUsers,
        forApprovalUsers,
        registeredUsers,
        pagedPendingUsers,
        pagedRejectedUsers,
        pagedRegisteredUsers,
        pendingSearch,
        setPendingSearch,
        rejectedSearch,
        setRejectedSearch,
        registeredSearch,
        setRegisteredSearch,
        pendingTotalPages,
        rejectedTotalPages,
        registeredTotalPages,
        pendingPage,
        setPendingPage,
        rejectedPage,
        setRejectedPage,
        registeredPage,
        setRegisteredPage,
        userAccordionProps,
        desktopColumns,
        openFullScreenImage,
        closeFullScreenImage,
        handleApprove,
        handleRejectClick,
        toggleReason,
        submitRejection,
        submitApproval,
        setProcessing,
        setModalImagesUser,
        setFullScreenImage,
        setImageTitle,
    };
}
