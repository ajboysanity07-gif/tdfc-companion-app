import { useIsMobileTabs } from '@/hooks/use-isMobile-tabs';
import axiosClient from '@/api/axios-client';
import type { PendingUser } from '@/types/user';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PAGESIZE = 10;

export function useClientManagement() {
    // Device detection
    const isMobileOrTablet = useIsMobileTabs();

    // All users for admin management
    const [allUsers, setAllUsers] = useState<PendingUser[] | null>(null);

    // Loading spinner
    const [loading, setLoading] = useState(false);

    // API: Fetch all users for management table/dashboard
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get<PendingUser[]>('clients');
            setAllUsers(data);
        } catch (err) {
            console.error('Failed to load clients', err);
            setAllUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch users on mount and after update
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Expanded row for desktop details accordion
    const [expanded, setExpanded] = useState<number | null>(null);

    // Expanded column for multi-table layout
    const [expandedColumn, setExpandedColumn] = useState<number | null>(null);

    // Selected user for modals/details
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

    // Approve Modal Popper states
    const [approvePopperAnchor, setApprovePopperAnchor] = useState<HTMLElement | null>(null);
    const [approvePopperUser, setApprovePopperUser] = useState<PendingUser | null>(null);

    // Fullscreen image modal states
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [imageTitle, setImageTitle] = useState<string>('');
    const [modalImagesUser, setModalImagesUser] = useState<PendingUser | null>(null);

    // Reject modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    // Search/filter states
    const [rejectedSearch, setRejectedSearch] = useState('');
    const [pendingSearch, setPendingSearch] = useState('');
    const [registeredSearch, setRegisteredSearch] = useState('');

    // Filtered lists based on status
    const rejectedUsers = useMemo(() => (allUsers ? allUsers.filter((u) => u.status === 'rejected') : []), [allUsers]);
    const forApprovalUsers = useMemo(() => (allUsers ? allUsers.filter((u) => u.status === 'pending') : []), [allUsers]);
    const registeredUsers = useMemo(() => (allUsers ? allUsers.filter((u) => u.status === 'approved') : []), [allUsers]);

    // Real-time searches
    const filteredPendingUsers = useMemo(
        () => (forApprovalUsers ? forApprovalUsers.filter((u) => u.name.toLowerCase().includes(pendingSearch.toLowerCase())) : []),
        [forApprovalUsers, pendingSearch],
    );
    const filteredRejectedUsers = useMemo(
        () => (rejectedUsers ? rejectedUsers.filter((u) => u.name.toLowerCase().includes(rejectedSearch.toLowerCase())) : []),
        [rejectedUsers, rejectedSearch],
    );
    const filteredRegisteredUsers = useMemo(
        () => (registeredUsers ? registeredUsers.filter((u) => u.name.toLowerCase().includes(registeredSearch.toLowerCase())) : []),
        [registeredUsers, registeredSearch],
    );

    // Paging
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

    const pendingTotalPages = Math.max(1, Math.ceil(filteredPendingUsers.length / PAGESIZE));
    const rejectedTotalPages = Math.max(1, Math.ceil(filteredRejectedUsers.length / PAGESIZE));
    const registeredTotalPages = Math.max(1, Math.ceil(filteredRegisteredUsers.length / PAGESIZE));

    // Pagination
    const pagedPendingUsers = useMemo(() => {
        if (allUsers === null) return null;
        const start = (pendingPage - 1) * PAGESIZE;
        return filteredPendingUsers.slice(start, start + PAGESIZE);
    }, [filteredPendingUsers, pendingPage, allUsers]);

    const pagedRejectedUsers = useMemo(() => {
        if (allUsers === null) return null;
        const start = (rejectedPage - 1) * PAGESIZE;
        return filteredRejectedUsers.slice(start, start + PAGESIZE);
    }, [filteredRejectedUsers, rejectedPage, allUsers]);

    const pagedRegisteredUsers = useMemo(() => {
        if (allUsers === null) return null;
        const start = (registeredPage - 1) * PAGESIZE;
        return filteredRegisteredUsers.slice(start, start + PAGESIZE);
    }, [filteredRegisteredUsers, registeredPage, allUsers]);

    // Image modal helpers
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const openFullScreenImage = (img: string, title: string) => {
        setFullScreenImage(img);
        setImageTitle(title);
    };
    const closeFullScreenImage = () => {
        setFullScreenImage(null);
        setImageTitle('');
        setModalImagesUser(null);
    };

    // Approve popper/modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleApprove = (event: React.MouseEvent<HTMLElement>, user: PendingUser) => {
        setApprovePopperAnchor(event.currentTarget);
        setApprovePopperUser(user);
    };

    // Reject modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleRejectClick = (user: PendingUser) => {
        setSelectedUser(user);
        setShowRejectModal(true);
        setSelectedReasons([]);
    };

    // Select/deselect rejection reasons
    const toggleReason = (reason: string) => {
        setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
    };

    // Submit rejection
    const submitRejection = useCallback(async () => {
        if (!selectedUser || selectedReasons.length === 0) return;
        setProcessing(true);
        setShowRejectModal(false); // close modal immediately for UX
        try {
            await axiosClient.post(`clients/${selectedUser.user_id}/reject`, { reasons: selectedReasons });
            await fetchUsers();
        } catch (err) {
            console.error('Rejection failed:', err);
        } finally {
            setProcessing(false);
            setSelectedUser(null);
            setSelectedReasons([]);
        }
    }, [selectedUser, selectedReasons, fetchUsers]);

    // Submit approval
    const submitApproval = useCallback(async () => {
        if (!approvePopperUser) return;
        setProcessing(true);
        try {
            await axiosClient.post(`clients/${approvePopperUser.user_id}/approve`);
            setApprovePopperAnchor(null);
            setApprovePopperUser(null);
            await fetchUsers();
        } finally {
            setProcessing(false);
        }
    }, [approvePopperUser, fetchUsers]);

    // Helper props for Desktop accordion
    const userAccordionProps = useCallback(
        (columnIndex: number) => ({
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
        [expanded, expandedColumn, isMobileOrTablet, openFullScreenImage, handleApprove, handleRejectClick, processing],
    );

    // Desktop columns config for tables
    const desktopColumns = useMemo(
        () => [
            {
                key: 'registered',
                title: 'REGISTERED USERS',
                titleColor: '#F57979',
                userCount: registeredUsers.length,
                searchOptions: registeredUsers.map((u) => u.name),
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
                searchOptions: forApprovalUsers.map((u) => u.name),
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
                searchOptions: rejectedUsers.map((u) => u.name),
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
            registeredUsers,
            registeredSearch,
            pagedRegisteredUsers,
            registeredTotalPages,
            registeredPage,
            setRegisteredSearch,
            setRegisteredPage,
            forApprovalUsers,
            pendingSearch,
            pagedPendingUsers,
            pendingTotalPages,
            pendingPage,
            setPendingSearch,
            setPendingPage,
            rejectedUsers,
            rejectedSearch,
            pagedRejectedUsers,
            rejectedTotalPages,
            rejectedPage,
            setRejectedSearch,
            setRejectedPage,
        ],
    );

    // Expose all states/helpers to your SPA page/components
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
        loading,
        fetchUsers,
    };
}
