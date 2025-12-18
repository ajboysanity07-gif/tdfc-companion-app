import React from 'react';
import { LinearProgress, Slide } from '@mui/material';
import { CircleCheckBig, CircleX } from 'lucide-react';
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
    error,
    success,
    fullScreenImage,
    imageTitle,
    modalImagesUser,
    closeFullScreenImage,
    showRejectModal,
    setShowRejectModal,
    selectedUser,
    selectedReasons,
    rejectionReasons,
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
      {loading ? (
        <LinearProgress
          color="primary"
          sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }}
        />
      ) : null}
      <Slide in={!!(loading || error || success)} direction="down" mountOnEnter unmountOnExit>
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
          {success ? (
            <div className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 flex items-center gap-2">
              <CircleCheckBig className="h-4 w-4" />
              <span>{success}</span>
            </div>
          ) : null}
          {loading ? (
            <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">
              Loading...
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30 flex items-center gap-2">
              <CircleX className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      </Slide>
      <div
        className="rounded-2xl flex flex-1 flex-col gap-4 overflow-x-auto bg-[#FAFAFA] p-4 pb-28 transition-colors duration-300 dark:bg-neutral-900"
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
          rejectionReasons={rejectionReasons}
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
