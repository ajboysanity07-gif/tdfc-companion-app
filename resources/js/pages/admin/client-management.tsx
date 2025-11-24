import React from 'react';
import ApprovePopper from '@/components/client-management/components/approve-popper';
import DesktopUserColumns from '@/components/client-management/components/desktop-user-columns';
import FullScreenImageModal from '@/components/client-management/components/fullscreen-image-modal';
import MobileUserTabs from '@/components/client-management/components/mobile-user-tabs';
import RejectModal from '@/components/client-management/components/reject-modal';
import { useClientManagement } from '@/hooks/use-client-management';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
  { title: 'Client Management', href: '/admin/client-management' },
];

// Apple separator style
const appleSeparator = (): React.CSSProperties => ({
  margin: 0,
  padding: 0,
  width: '92%',
  height: '1.5px',
  background: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'rgba(84,84,88,0.24)'
      : 'rgba(60,60,67,0.14)'
    : 'rgba(60,60,67,0.14)',
  borderRadius: '2px',
  alignSelf: 'center',
  marginTop: '0.5rem',
});

export default function ClientManagementPage() {
  const {
    isMobileOrTablet,
    registeredUsers,
    forApprovalUsers,
    rejectedUsers,
    pagedRegisteredUsers,
    pagedPendingUsers,
    pagedRejectedUsers,
    registeredSearch,
    setRegisteredSearch,
    pendingSearch,
    setPendingSearch,
    rejectedSearch,
    setRejectedSearch,
    registeredTotalPages,
    pendingTotalPages,
    rejectedTotalPages,
    registeredPage,
    setRegisteredPage,
    pendingPage,
    setPendingPage,
    rejectedPage,
    setRejectedPage,
    userAccordionProps,
    desktopColumns,
    approvePopperAnchor,
    setApprovePopperAnchor,
    approvePopperUser,
    setApprovePopperUser,
    processing,
    loading,
    fullScreenImage,
    imageTitle,
    modalImagesUser,
    closeFullScreenImage,
    showRejectModal,
    setShowRejectModal,
    selectedUser,
    selectedReasons,
    toggleReason,
    submitRejection,
    submitApproval,
  } = useClientManagement();

  // Loading state from hook (API fetch)
  const loadingState = loading;

  // Optional: For multiple desktop columns, you can make loadingColumns = [loading,...]:
  const loadingColumns = desktopColumns.map(() => loadingState);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div
        className="rounded-2xl flex flex-1 flex-col gap-4 overflow-x-auto bg-[#FAFAFA] p-4 transition-colors duration-300 dark:bg-neutral-900"
        style={{ minHeight: '100vh' }}
      >
        <div className="relative mb-6 h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
          <div className="relative z-10 p-6">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">
              Client Management
            </h1>
            <div className="text-[1.08rem] font-medium text-white opacity-90">
              Review and approve client registrations
            </div>
          </div>
        </div>

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
            loading={loadingState}
          />
        ) : (
          <DesktopUserColumns
            columns={desktopColumns}
            userAccordionProps={userAccordionProps}
            appleSeparator={appleSeparator}
            loadingColumns={loadingColumns}
          />
        )}

        {/* Modals */}
        <ApprovePopper
          open={!!approvePopperAnchor}
          anchorEl={approvePopperAnchor}
          user={approvePopperUser}
          isMobile={isMobileOrTablet}
          processing={processing}
          onCancel={() => {
            setApprovePopperAnchor(null);
            setApprovePopperUser(null);
          }}
          onApprove={submitApproval}
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
          open={showRejectModal}
          user={selectedUser}
          rejectionReasons={[
            { id: 1, code: 'prc_id_blurry', label: 'Blurry PRC ID' },
            { id: 2, code: 'not_prc_id', label: 'Not a PRC ID' },
            { id: 3, code: 'prc_id_expired', label: 'Expired PRC ID' },
            { id: 4, code: 'payslip_blurry', label: 'Blurry Payslip' },
            { id: 5, code: 'payslip_too_old', label: 'Payslip too old' },
            { id: 6, code: 'documents_tampered', label: 'Documents tampered' },
          ]}
          selectedReasons={selectedReasons}
          processing={processing}
          onClose={() => setShowRejectModal(false)}
          onToggleReason={toggleReason}
          onSubmit={submitRejection}
        />
      </div>
    </AppLayout>
  );
}
