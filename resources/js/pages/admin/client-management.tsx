import { CLIENT_LIST_PAGE_SIZE } from '@/components/admin/client-management/skeletons';
import ClientManagementSkeleton from '@/components/admin/client-management/client-management-skeleton';
import ClientDetails from '@/components/admin/client-management/client-details';
import ClientList from '@/components/admin/client-management/client-list';
import RejectModal from '@/components/admin/client-management/reject-modal';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import DesktopViewLayout from '@/components/desktop-view-layout';
import MobileViewLayout from '@/components/mobile-view-layout';
import { useClientManagement } from '@/hooks/use-client-management';
import AppLayout from '@/layouts/app-layout';
import { LinearProgress, Slide, useMediaQuery, Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
    AmortschedDisplayEntry,
    Client,
    RejectionReasonEntry,
    RegistrationStatus,
    WlnMasterRecord,
    WlnMasterResponse,
    WlnLedEntry,
} from '@/types/user';
import HeaderBlock from '@/components/management/header-block';

const breadcrumbs = [{ title: 'Client Management', href: '/admin/client-management' }];

type ClientDesktopProps = {
    clients: Client[];
    rejectionReasons: RejectionReasonEntry[];
    selectedId: number | null;
    onSelect: (userId: number | null) => void;
    onApprove: (userId: number) => Promise<void> | void;
    onReject: (userId: number, reasons: string[]) => Promise<void> | void;
    onSaveSalary: (acctno: string, salary: number) => Promise<void> | void;
    fetchWlnMaster: (acctno: string) => Promise<WlnMasterResponse | null>;
    wlnMasterByAcctno: Record<string, WlnMasterRecord[]>;
    wlnMasterLoading: Record<string, boolean>;
    fetchAmortsched: (lnnumber: string) => Promise<unknown> | void;
    amortschedByLnnumber: Record<string, AmortschedDisplayEntry[]>;
    amortschedLoading: Record<string, boolean>;
    fetchWlnLed: (lnnumber: string) => Promise<unknown> | void;
    wlnLedByLnnumber: Record<string, WlnLedEntry[]>;
    wlnLedLoading: Record<string, boolean>;
    statusTab: RegistrationStatus;
    onStatusTabChange: (value: RegistrationStatus) => void;
};

function ClientDesktopLayoutView({
    clients,
    rejectionReasons,
    selectedId,
    onSelect,
    onApprove,
    onReject,
    onSaveSalary,
    fetchWlnMaster,
    wlnMasterByAcctno,
    wlnMasterLoading,
    fetchAmortsched,
    amortschedByLnnumber,
    amortschedLoading,
    fetchWlnLed,
    wlnLedByLnnumber,
    wlnLedLoading,
    statusTab,
    onStatusTabChange,
}: ClientDesktopProps) {
    const [search, setSearch] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [pendingRejectReasons, setPendingRejectReasons] = useState<string[]>([]);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return clients.filter((c) => {
            if (!term) return true;
            return (
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                c.acctno.toLowerCase().includes(term)
            );
        });
    }, [clients, search]);

    const activeClient = useMemo(() => clients.find((c) => c.user_id === selectedId) ?? null, [clients, selectedId]);
    const wlnMasterRecords = activeClient ? wlnMasterByAcctno[activeClient.acctno] : undefined;
    const wlnLoading = activeClient ? wlnMasterLoading[activeClient.acctno] : false;

    useEffect(() => {
        if (!activeClient?.acctno) return;
        const acctno = activeClient.acctno;
        if (wlnMasterByAcctno[acctno] || wlnMasterLoading[acctno]) return;
        fetchWlnMaster(acctno);
    }, [activeClient, fetchWlnMaster, wlnMasterByAcctno, wlnMasterLoading]);

    const openReject = () => {
        if (!activeClient) return;
        setPendingRejectReasons(activeClient.rejection_reasons?.map((r) => r.code) ?? []);
        setShowRejectModal(true);
    };

    const submitReject = (reasons: string[]) => {
        if (!activeClient) return;
        onReject(activeClient.user_id, reasons);
    };

    return (
        <DesktopViewLayout
            left={
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <ClientList
                            clients={filtered}
                        onSelect={(id) => onSelect(id)}
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchOptions={clients.map((c) => c.name)}
                        fullHeight
                        enableStatusTabs
                        statusTab={statusTab}
                        onStatusTabChange={onStatusTabChange}
                    />
                </Box>
            </Box>
        }
            right={
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeClient ? activeClient.user_id : 'empty'}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22, mass: 0.7 }}
                        style={{ display: 'flex', flex: 1 }}
                    >
                        <ClientDetails
                            client={activeClient}
                            onApprove={onApprove}
                            onRejectClick={openReject}
                            onSaveSalary={onSaveSalary}
                            wlnMasterRecords={wlnMasterRecords}
                            loading={!!wlnLoading}
                            fetchAmortsched={fetchAmortsched}
                            amortschedByLnnumber={amortschedByLnnumber}
                            amortschedLoading={amortschedLoading}
                            fetchWlnLed={fetchWlnLed}
                            wlnLedByLnnumber={wlnLedByLnnumber}
                            wlnLedLoading={wlnLedLoading}
                        />
                    </motion.div>
                </AnimatePresence>
            }
            afterStack={
                <RejectModal
                    open={showRejectModal}
                    reasons={rejectionReasons}
                    selected={pendingRejectReasons}
                    clientName={activeClient?.name}
                    onClose={() => setShowRejectModal(false)}
                    onSubmit={submitReject}
                />
            }
            leftSx={{ p: 4, minHeight: 600, gap: 2 }}
            rightSx={{ p: 4, minHeight: 1110 }}
        />
    );
}

type ClientMobileProps = {
    clients: Client[];
    rejectionReasons: RejectionReasonEntry[];
    selectedId?: number | null;
    onSelect?: (userId: number | null) => void;
    onApprove: (userId: number) => Promise<void> | void;
    onReject: (userId: number, reasons: string[]) => Promise<void> | void;
    onSaveSalary: (acctno: string, salary: number) => Promise<void> | void;
    fetchWlnMaster: (acctno: string) => Promise<WlnMasterResponse | null>;
    wlnMasterByAcctno: Record<string, WlnMasterRecord[]>;
    wlnMasterLoading: Record<string, boolean>;
    fetchAmortsched: (lnnumber: string) => Promise<unknown> | void;
    amortschedByLnnumber: Record<string, AmortschedDisplayEntry[]>;
    amortschedLoading: Record<string, boolean>;
    fetchWlnLed: (lnnumber: string) => Promise<unknown> | void;
    wlnLedByLnnumber: Record<string, WlnLedEntry[]>;
    wlnLedLoading: Record<string, boolean>;
    statusTab: RegistrationStatus;
    onStatusTabChange: (value: RegistrationStatus) => void;
};

function ClientMobileLayoutView({
    clients,
    rejectionReasons,
    selectedId = null,
    onSelect,
    onApprove,
    onReject,
    onSaveSalary,
    fetchWlnMaster,
    wlnMasterByAcctno,
    wlnMasterLoading,
    fetchAmortsched,
    amortschedByLnnumber,
    amortschedLoading,
    fetchWlnLed,
    wlnLedByLnnumber,
    wlnLedLoading,
    statusTab,
    onStatusTabChange,
}: ClientMobileProps) {
    const [search, setSearch] = useState('');
    const [localSelectedId, setLocalSelectedId] = useState<number | null>(selectedId);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [pendingRejectReasons, setPendingRejectReasons] = useState<string[]>([]);

    useEffect(() => {
        setLocalSelectedId(selectedId);
        if (selectedId != null) {
            setDetailsOpen(true);
        }
    }, [selectedId]);

    const activeClient = useMemo(
        () => clients.find((c) => c.user_id === localSelectedId) ?? null,
        [clients, localSelectedId],
    );
    const wlnMasterRecords = activeClient ? wlnMasterByAcctno[activeClient.acctno] : undefined;
    const wlnLoading = activeClient ? wlnMasterLoading[activeClient.acctno] : false;

    useEffect(() => {
        if (!activeClient?.acctno) return;
        const acctno = activeClient.acctno;
        if (wlnMasterByAcctno[acctno] || wlnMasterLoading[acctno]) return;
        fetchWlnMaster(acctno);
    }, [activeClient, fetchWlnMaster, wlnMasterByAcctno, wlnMasterLoading]);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return clients.filter((c) => {
            if (!term) return true;
            return (
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                c.acctno.toLowerCase().includes(term)
            );
        });
    }, [clients, search]);

    const handleSelect = (userId: number) => {
        setLocalSelectedId(userId);
        onSelect?.(userId);
        const found = clients.find((c) => c.user_id === userId);
        setPendingRejectReasons(found?.rejection_reasons?.map((r) => r.code) ?? []);
        setDetailsOpen(true);
    };

    const closeDetails = () => {
        setDetailsOpen(false);
        setLocalSelectedId(null);
        onSelect?.(null);
    };

    const openReject = () => {
        if (!activeClient) return;
        setPendingRejectReasons(activeClient.rejection_reasons?.map((r) => r.code) ?? []);
        setRejectOpen(true);
    };

    const handleSubmitReject = (reasons: string[]) => {
        if (!activeClient) return;
        onReject(activeClient.user_id, reasons);
        setRejectOpen(false);
        closeDetails();
    };

    return (
        <MobileViewLayout
            footer={
                <>
                    <FullScreenModalMobile
                        open={detailsOpen}
                        title={activeClient ? activeClient.name : 'Client Details'}
                        onClose={closeDetails}
                        bodyClassName="client-details-open"
                        paperSx={{ pb: 0 }}
                        bodySx={{ pb: { xs: 10, sm: 6 } }}
                    >
                        <ClientDetails
                            client={activeClient}
                            onApprove={onApprove}
                            onRejectClick={openReject}
                            onSaveSalary={onSaveSalary}
                            wlnMasterRecords={wlnMasterRecords}
                            loading={!!wlnLoading}
                            showName={false}
                            fetchAmortsched={fetchAmortsched}
                            amortschedByLnnumber={amortschedByLnnumber}
                            amortschedLoading={amortschedLoading}
                            fetchWlnLed={fetchWlnLed}
                            wlnLedByLnnumber={wlnLedByLnnumber}
                            wlnLedLoading={wlnLedLoading}
                        />
                    </FullScreenModalMobile>

                    <RejectModal
                        open={rejectOpen}
                        reasons={rejectionReasons}
                        selected={pendingRejectReasons}
                        onClose={() => setRejectOpen(false)}
                        onSubmit={handleSubmitReject}
                        clientName={activeClient?.name}
                    />
                </>
            }
        >
            <ClientList
                clients={filtered}
                onSelect={handleSelect}
                searchValue={search}
                onSearchChange={setSearch}
                searchOptions={clients.map((c) => c.name)}
                fullHeight
                enableStatusTabs
                statusTab={statusTab}
                onStatusTabChange={onStatusTabChange}
            />
        </MobileViewLayout>
    );
}

export default function ClientManagementPage() {
    const {
        clients,
        rejectionReasons,
        loading,
        error,
        success,
        wlnMasterByAcctno,
        wlnMasterLoading,
        amortschedByLnnumber,
        amortschedLoading,
        fetchRejectionReasons,
        fetchClients,
        approveClient,
        rejectClient,
        updateSalary,
        fetchWlnMaster,
        fetchAmortsched,
        wlnLedByLnnumber,
        wlnLedLoading,
        fetchWlnLed,
    } = useClientManagement();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [statusTab, setStatusTab] = useState<RegistrationStatus>('approved');
    const isMobile = useMediaQuery('(max-width:900px)');
    const approvedCount = useMemo(() => clients.filter((c) => c.status === 'approved').length, [clients]);

    useEffect(() => {
        fetchClients();
        fetchRejectionReasons();
    }, [fetchClients, fetchRejectionReasons]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, []);

    useEffect(() => {
        if (!loading) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    }, [loading]);

    const handleApprove = async (user_id: number) => {
        approveClient(user_id).then(() => setSelectedId(null));
    };

    const handleReject = async (user_id: number, reasons: string[]) => {
        rejectClient(user_id, reasons).then(() => setSelectedId(null));
    };

    const handleSaveSalary = async (acctno: string, salary_amount: number) => {
        updateSalary(acctno, { salary_amount });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {loading ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 60 }} /> : null}
            <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
                <Slide in={!!success} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30">
                        <CircleCheckBig className="h-4 w-4" />
                        <span>{success}</span>
                    </div>
                </Slide>
                <Slide in={!!loading} direction="down" mountOnEnter unmountOnExit>
                    <div className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/30">Loading...</div>
                </Slide>
                <Slide in={!!error} direction="down" mountOnEnter unmountOnExit>
                    <div className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30">
                        <CircleX className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                </Slide>
            </div>
            <div className="flex flex-col gap-0 overflow-x-auto bg-[#FAFAFA] transition-colors duration-300 dark:bg-neutral-900">
                {!isMobile || !selectedId ? (
                    <HeaderBlock title="Client Management" subtitle="Review, approve, and manage clients" />
                ) : null}

                {loading ? (
                    <ClientManagementSkeleton itemCount={Math.max(approvedCount || clients.length, CLIENT_LIST_PAGE_SIZE)} isMobile={isMobile} selectedId={selectedId} />
                ) : isMobile ? (
                    <ClientMobileLayoutView
                        clients={clients}
                        rejectionReasons={rejectionReasons}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSaveSalary={handleSaveSalary}
                        fetchWlnMaster={fetchWlnMaster}
                        wlnMasterByAcctno={wlnMasterByAcctno}
                        wlnMasterLoading={wlnMasterLoading}
                        fetchAmortsched={fetchAmortsched}
                        amortschedByLnnumber={amortschedByLnnumber}
                        amortschedLoading={amortschedLoading}
                        fetchWlnLed={fetchWlnLed}
                        wlnLedByLnnumber={wlnLedByLnnumber}
                        wlnLedLoading={wlnLedLoading}
                        statusTab={statusTab}
                        onStatusTabChange={setStatusTab}
                    />
                ) : (
                    <ClientDesktopLayoutView
                        clients={clients}
                        rejectionReasons={rejectionReasons}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onSaveSalary={handleSaveSalary}
                        fetchWlnMaster={fetchWlnMaster}
                        wlnMasterByAcctno={wlnMasterByAcctno}
                        wlnMasterLoading={wlnMasterLoading}
                        fetchAmortsched={fetchAmortsched}
                        amortschedByLnnumber={amortschedByLnnumber}
                        amortschedLoading={amortschedLoading}
                        fetchWlnLed={fetchWlnLed}
                        wlnLedByLnnumber={wlnLedByLnnumber}
                        wlnLedLoading={wlnLedLoading}
                        statusTab={statusTab}
                        onStatusTabChange={setStatusTab}
                    />
                )}
            </div>
        </AppLayout>
    );
}
