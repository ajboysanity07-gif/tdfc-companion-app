// hooks/useClientManagement.ts
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { PendingUser } from '@/types/user';

export function useClientManagement(pendingUsers: PendingUser[]) {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [tab, setTab] = useState(1);
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [imageTitle, setImageTitle] = useState<string>('');

    const [approvePopperAnchor, setApprovePopperAnchor] = useState<null | HTMLElement>(null);
    const [approvePopperUser, setApprovePopperUser] = useState<PendingUser | null>(null);

    const forApprovalUsers = pendingUsers?.filter((u) => u.status === 'pending') || [];
    const registeredUsers = pendingUsers?.filter((u) => u.status !== 'pending') || [];
    const currentUsers = tab === 0 ? registeredUsers : forApprovalUsers;
    const [modalImagesUser, setModalImagesUser] = useState<PendingUser | null>(null);
    function openFullScreenImage(imageUrl: string, title: string) {
        setFullScreenImage(imageUrl);
        setImageTitle(title);
    }
    function closeFullScreenImage() {
        setFullScreenImage(null);
        setImageTitle('');
    };

    function handleApprove(event: React.MouseEvent<HTMLElement>, user: PendingUser){
        setApprovePopperAnchor(event.currentTarget);
        setApprovePopperUser(user);
    };

    function closeApprovePopper() {
        setApprovePopperAnchor(null);
        setApprovePopperUser(null);
    };

    function confirmApprove() {
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

    function handleRejectClick(user: PendingUser){
        setSelectedUser(user);
        setSelectedReasons([]);
        setShowRejectModal(true);
    };
    function toggleReason(reason: string){
        setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
    };

    function submitRejection() {
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

  // Expose all states and handlers
  return {
    expanded, setExpanded, tab, setTab, selectedUser, setSelectedUser, showRejectModal, setShowRejectModal,
    selectedReasons, setSelectedReasons, processing, setProcessing, fullScreenImage, setFullScreenImage,
    imageTitle, setImageTitle, approvePopperAnchor, setApprovePopperAnchor, approvePopperUser,
    setApprovePopperUser, openFullScreenImage, closeFullScreenImage, handleApprove, closeApprovePopper,
    confirmApprove, handleRejectClick, toggleReason, submitRejection, modalImagesUser, setModalImagesUser,
    forApprovalUsers, registeredUsers, currentUsers
  };
}
