import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useMyTheme } from '@/hooks/use-mytheme';
import type { Client } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck, CircleX } from 'lucide-react';
import BoxHeader from '@/components/box-header';
import ImageModal from '@/components/ui/image-modal';
import FullScreenModalMobile from '@/components/ui/full-screen-modal-mobile';
import AmortschedTable from '@/components/common/amortsched-table';
import PaymentLedgerTable from '@/components/common/payment-ledger-table';

type Props = {
    client?: Client | null;
    onApprove?: (userId: number) => void;
    onRejectClick?: () => void;
    onReject?: (userId: number) => void;
    onSaveSalary?: (acctno: string, salary: number) => Promise<void>;
    wlnMasterRecords?: any[];
    loading?: boolean;
    fetchAmortsched?: (lnnumber: string) => void;
    amortschedByLnnumber?: Record<string, any[]>;
    amortschedLoading?: Record<string, boolean>;
    fetchWlnLed?: (lnnumber: string) => void;
    wlnLedByLnnumber?: Record<string, any[]>;
    wlnLedLoading?: Record<string, boolean>;
    isLoading?: boolean;
};

const ClientDetails: React.FC<Props> = ({ 
    client, 
    onApprove, 
    onRejectClick,
    onReject,
    isLoading = false,
    wlnMasterRecords,
    onSaveSalary,
    loading,
    fetchAmortsched,
    amortschedByLnnumber,
    amortschedLoading,
    fetchWlnLed,
    wlnLedByLnnumber,
    wlnLedLoading,
}) => {
    const tw = useMyTheme();
    const isMobile = useMediaQuery('(max-width: 600px)');
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState<Array<{ src: string; label: string }>>([]);
    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [editedSalary, setEditedSalary] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
    const [selectedLoanNumber, setSelectedLoanNumber] = useState<string | null>(null);

    const getProfileImage = (client: Client): string | null => {
        const picture = client.profile_picture_url ?? client.profile_picture_path;
        if (!picture) return null;
        if (picture.startsWith('http') || picture.startsWith('data:') || picture.startsWith('/storage')) return picture;
        return `/storage/${picture.replace(/^\/+/, '')}`;
    };

    const getInitials = (name?: string): string => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    if ((isLoading || loading) || !client) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-muted/50 h-full flex flex-col items-center justify-center gap-4 p-8"
            >
                <div className="text-muted-foreground text-center">
                    {isLoading || loading ? (
                        <>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-lg font-medium">Loading client details...</p>
                        </>
                    ) : (
                        <>
                            <svg
                                className="mx-auto h-16 w-16 mb-4 opacity-50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <p className="text-lg font-medium">Select a client to view details</p>
                            <p className="text-sm mt-2 opacity-70">Choose a client from the list to review their information</p>
                        </>
                    )}
                </div>
            </motion.div>
        );
    }

    const profileImage = getProfileImage(client);
    const initials = getInitials(client.name);
    const isPending = client.status === 'pending';

    return (
        <>
        {/* Status Message */}
        <AnimatePresence>
            {saveStatus !== 'idle' && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{
                        position: 'fixed',
                        top: '80px',
                        left: 0,
                        right: 0,
                        zIndex: 10000,
                        display: 'flex',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            backgroundColor: saveStatus === 'saving' ? (tw.isDark ? '#1e293b' : '#f1f5f9') : saveStatus === 'success' ? '#10b981' : '#ef4444',
                            color: saveStatus === 'saving' ? (tw.isDark ? '#fff' : '#000') : '#fff',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto',
                        }}
                    >
                        {saveStatus === 'saving' && (
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid transparent',
                                borderTopColor: tw.isDark ? '#fff' : '#000',
                                borderRadius: '50%',
                                animation: 'spin 0.6s linear infinite',
                            }} />
                        )}
                        {saveStatus === 'success' && <CircleCheck size={16} />}
                        {saveStatus === 'error' && <CircleX size={16} />}
                        <span>{saveMessage}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                borderRadius: '24px',
                backgroundColor: tw.isDark ? '#171717' : '#FAFAFA',
                padding: isMobile ? '24px 16px' : '40px',
                paddingBottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px',
                height: '100%',
                width: '100%',
                overflowY: 'auto',
            }}
        >
            {/* Client Name Header */}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: tw.isDark ? '#ffffff' : '#000000', margin: 0, textAlign: 'center' }}>
                {client.name}
            </h1>

            {/* Profile Image - Centered */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                    style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: profileImage ? `url('${profileImage}')` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '56px',
                        flexShrink: 0,
                        border: `3px solid ${tw.isDark ? '#262626' : '#FFFFFF'}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    {!profileImage && initials}
                </div>
            </div>

            {/* Class and Salary - Side by Side */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {/* Class */}
                <div style={{ flex: 1, maxWidth: '40%' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '8px', letterSpacing: '0.5px', textAlign: 'center' }}>
                        Class
                    </label>
                    <div
                        style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                            color: tw.isDark ? '#ffffff' : '#000000',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            textAlign: 'center',
                        }}
                    >
                        {client.class ?? 'N/A'}
                    </div>
                </div>

                {/* Salary */}
                <div style={{ flex: 1, maxWidth: '40%' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '8px', letterSpacing: '0.5px', textAlign: 'center' }}>
                        Salary
                    </label>
                    {isEditingSalary ? (
                        <input
                            type="number"
                            value={editedSalary}
                            onChange={(e) => setEditedSalary(e.target.value)}
                            onBlur={async () => {
                                setIsEditingSalary(false);
                                const newSalary = parseFloat(editedSalary);
                                if (!isNaN(newSalary) && newSalary !== client.salary_amount && onSaveSalary && client.acctno) {
                                    setSaveStatus('saving');
                                    setSaveMessage('Saving salary...');
                                    try {
                                        await onSaveSalary(client.acctno, newSalary);
                                        setSaveStatus('success');
                                        setSaveMessage('Salary saved successfully!');
                                        setTimeout(() => setSaveStatus('idle'), 3000);
                                    } catch (error) {
                                        console.error('Error saving salary:', error);
                                        setSaveStatus('error');
                                        setSaveMessage('Failed to save salary. Please try again.');
                                        setTimeout(() => setSaveStatus('idle'), 3000);
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: `2px solid ${tw.isDark ? 'rgba(96,165,250,0.5)' : 'rgba(59,130,246,0.5)'}`,
                                color: tw.isDark ? '#ffffff' : '#000000',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                outline: 'none',
                            }}
                        />
                    ) : (
                        <div
                            onClick={() => {
                                setIsEditingSalary(true);
                                setEditedSalary(client.salary_amount?.toString() || '0');
                            }}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '12px',
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                                color: tw.isDark ? '#ffffff' : '#000000',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
                            }}
                        >
                            ₱ {client.salary_amount ? client.salary_amount.toLocaleString() : '0'}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Loans Section */}
            {wlnMasterRecords && wlnMasterRecords.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.5px', textAlign: 'center' }}>
                        Product Loans
                    </label>
                    {wlnMasterRecords.map((loan, index) => (
                        <div
                            key={loan.lnnumber || index}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                            }}
                        >
                            {/* Left: Loan Details */}
                            <div style={{ flex: 1 }}>
                                {/* Loan Title */}
                                <div style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 700, 
                                    marginBottom: '4px',
                                    color: tw.isDark ? '#ffffff' : '#000000',
                                }}>
                                    {loan.remarks || loan.typecode || 'N/A'}
                                </div>

                                {/* Loan Number */}
                                <div style={{ 
                                    fontSize: '0.75rem',
                                    color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                                    marginBottom: '8px',
                                }}>
                                    {loan.lnnumber || 'N/A'}
                                </div>

                                {/* Loan Details */}
                                <div style={{ 
                                    fontSize: '0.875rem',
                                    color: tw.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>Amount: </span>
                                        <span>₱{typeof loan.principal === 'number' ? loan.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : loan.principal || '0.00'}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>Last Transaction: </span>
                                        <span>{loan.date_end ? new Date(loan.date_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                <button
                                    onClick={() => {
                                        setSelectedLoanNumber(loan.lnnumber || null);
                                        setScheduleModalOpen(true);
                                        if (loan.lnnumber && fetchAmortsched) {
                                            fetchAmortsched(loan.lnnumber);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        transition: 'all 120ms ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#dc2626';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#ef4444';
                                    }}
                                >
                                    SCHEDULE
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedLoanNumber(loan.lnnumber || null);
                                        setPaymentsModalOpen(true);
                                        if (loan.lnnumber && fetchWlnLed) {
                                            fetchWlnLed(loan.lnnumber);
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                                        backgroundColor: 'transparent',
                                        color: tw.isDark ? '#ffffff' : '#000000',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        transition: 'all 120ms ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    PAYMENTS
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PRC ID Section - Only for pending */}
            {isPending && (client.prc_id_photo_front || client.prc_id_photo_back) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                        PRC ID
                    </label>
                    <div 
                        style={{
                            width: '160px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                            display: 'flex',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onClick={() => {
                            const images = [];
                            if (client.prc_id_photo_front) {
                                images.push({
                                    src: `/storage/${client.prc_id_photo_front.replace(/^\/+/, '')}`,
                                    label: 'Front'
                                });
                            }
                            if (client.prc_id_photo_back) {
                                images.push({
                                    src: `/storage/${client.prc_id_photo_back.replace(/^\/+/, '')}`,
                                    label: 'Back'
                                });
                            }
                            setModalImages(images);
                            setImageModalOpen(true);
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {client.prc_id_photo_front && (
                            <div
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundImage: `url('/storage/${client.prc_id_photo_front.replace(/^\/+/, '')}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    borderRight: client.prc_id_photo_back ? `1px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}` : 'none',
                                }}
                            >
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.8)', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', marginBottom: '4px' }}>
                                    Front
                                </div>
                            </div>
                        )}
                        {client.prc_id_photo_back && (
                            <div
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundImage: `url('/storage/${client.prc_id_photo_back.replace(/^\/+/, '')}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                }}
                            >
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.8)', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', marginBottom: '4px' }}>
                                    Back
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payslip Section - Only for pending */}
            {isPending && client.payslip_photo_path && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tw.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                        Payslip
                    </label>
                    <div
                        style={{
                            width: '160px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: tw.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${tw.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundImage: `url('/storage/${client.payslip_photo_path.replace(/^\/+/, '')}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onClick={() => {
                            setModalImages([{
                                src: `/storage/${client.payslip_photo_path.replace(/^\/+/, '')}`,
                                label: 'Payslip'
                            }]);
                            setImageModalOpen(true);
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
            )}

            {/* Action Buttons - Only show if pending */}
            {isPending && (onRejectClick || onApprove) && (
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '24px', flexDirection: 'column' }}>
                    <button
                        onClick={() => onRejectClick?.()}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: `2px solid #ef4444`,
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            transition: 'all 120ms ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = tw.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        ❤️ Reject
                    </button>
                    <button
                        onClick={() => onApprove?.(client.user_id)}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            transition: 'all 120ms ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                        }}
                    >
                        👍 Accept
                    </button>
                </div>
            )}
        </motion.div>

        {/* Image Modal */}
        <ImageModal
            open={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            images={modalImages}
        />

        {/* Schedule Modal */}
        <FullScreenModalMobile
            open={scheduleModalOpen}
            onClose={() => {
                setScheduleModalOpen(false);
                setSelectedLoanNumber(null);
            }}
            title="Amortization Schedule"
            headerBg="#e14e4e"
        >
            {selectedLoanNumber && amortschedByLnnumber?.[selectedLoanNumber] && (
                <AmortschedTable
                    rows={amortschedByLnnumber[selectedLoanNumber] || []}
                    loading={amortschedLoading?.[selectedLoanNumber] || false}
                    lnnumber={selectedLoanNumber}
                    onRefresh={() => {
                        if (selectedLoanNumber && fetchAmortsched) {
                            fetchAmortsched(selectedLoanNumber);
                        }
                    }}
                />
            )}
        </FullScreenModalMobile>

        {/* Payments Modal */}
        <FullScreenModalMobile
            open={paymentsModalOpen}
            onClose={() => {
                setPaymentsModalOpen(false);
                setSelectedLoanNumber(null);
            }}
            title="Payment Ledger"
            headerBg="#e14e4e"
        >
            {selectedLoanNumber && wlnLedByLnnumber?.[selectedLoanNumber] && (
                <PaymentLedgerTable
                    rows={wlnLedByLnnumber[selectedLoanNumber] || []}
                    loading={wlnLedLoading?.[selectedLoanNumber] || false}
                    lnnumber={selectedLoanNumber}
                    onRefresh={() => {
                        if (selectedLoanNumber && fetchWlnLed) {
                            fetchWlnLed(selectedLoanNumber);
                        }
                    }}
                />
            )}
        </FullScreenModalMobile>
    </>
);
};

export default ClientDetails;
