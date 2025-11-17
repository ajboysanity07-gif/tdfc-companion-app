import { PendingUser } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

// Helper and Hook for responsive device category
const getDeviceCategory = () => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth <= 600) return 'mobile';
    if (window.innerWidth <= 1100) return 'tablet';
    return 'desktop';
};

const useDeviceCategory = () => {
    const [device, setDevice] = React.useState(getDeviceCategory());
    React.useEffect(() => {
        const onResize = () => setDevice(getDeviceCategory());
        window.addEventListener('resize', onResize);
        onResize(); // Sync on mount
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return device;
};

interface Props {
    open: boolean;
    imageUrl: string | null;
    title: string;
    modalImagesUser: PendingUser | null;
    isMobile: boolean;
    onClose: () => void;
}

// Sub-label component
const SubLabel: React.FC<{ children: React.ReactNode; device: string }> = ({ children, device }) => (
    <span
        style={{
            display: 'block',
            color: '#f7f7f7',
            fontWeight: 500,
            opacity: 0.89,
            textShadow: '0 2px 8px rgba(0,0,0,0.22)',
            marginBottom: device === 'mobile' ? 12 : device === 'tablet' ? 20 : 18,
            fontSize: device === 'mobile' ? 15 : device === 'tablet' ? 21 : 19,
            letterSpacing: 0.7,
            textAlign: 'center',
            marginTop: device === 'mobile' ? 6 : device === 'tablet' ? 12 : 12,
            textTransform: 'capitalize',
        }}
    >
        {children}
    </span>
);

const FullScreenImageModal: React.FC<Props> = ({ open, imageUrl, title, modalImagesUser, onClose }) => {
    const device = useDeviceCategory();

    // Label logic
    let headerLabel = 'Document';
    if (imageUrl === 'prc-both') headerLabel = 'PRC ID';
    else if (title) headerLabel = title;
    else if (imageUrl && imageUrl.toLowerCase().includes('payslip')) headerLabel = 'Payslip';

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm"
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 50,
                        padding: device === 'mobile' ? 6 : device === 'tablet' ? 24 : 34,
                    }}
                >
                    {/* --- HEADER LABEL: Always visible & always on top --- */}
                    <div
                        style={{
                            position: 'fixed', // fix so it stays on top
                            top: device === 'mobile' ? 18 : device === 'tablet' ? 28 : 38,
                            left: device === 'mobile' ? 16 : device === 'tablet' ? 30 : 48,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: device === 'mobile' ? 18 : device === 'tablet' ? 36 : 30,
                            letterSpacing: 0.6,
                            zIndex: 200,
                            textShadow: '0 2px 12px rgba(0,0,0,0.22)',
                            userSelect: 'none',
                            fontFamily: 'inherit',
                            pointerEvents: 'none', // prevents dragging issue
                        }}
                    >
                        {headerLabel}
                    </div>

                    {/* --- CLOSE BUTTON (with label), always top right --- */}
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute flex items-center gap-2 text-white transition-transform hover:scale-110"
                        style={{
                            top: device === 'mobile' ? 14 : device === 'tablet' ? 28 : 38,
                            right: device === 'mobile' ? 14 : device === 'tablet' ? 30 : 48,
                            zIndex: 200,
                            background: 'transparent',
                            border: 'none',
                            padding: '2px 10px',
                        }}
                    >
                        {' '}
                        <span
                            style={{
                                fontWeight: 200,
                                fontSize: device === 'mobile' ? 14 : device === 'tablet' ? 16 : 16,
                                color: '#fff',
                                letterSpacing: 0.5,
                                opacity: 0.9,
                                textShadow: '0 2px 8px rgba(0,0,0,0.16)',
                                userSelect: 'none',
                            }}
                        >
                            Close
                        </span>
                        <X className={device === 'mobile' ? 'h-7 w-7' : device === 'tablet' ? 'h-8 w-8' : 'h-8 w-8'} />
                    </button>

                    {/* --- MODAL CONTENT --- */}
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        className="relative flex w-full max-w-full items-center justify-center"
                        style={{
                            maxHeight: device === 'mobile' ? '82vh' : '90vh',
                            width: '100%',
                            marginTop: device === 'mobile' ? 24 : device === 'tablet' ? 28 : 0,
                            marginBottom: device === 'mobile' ? 20 : device === 'tablet' ? 26 : 0,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {imageUrl === 'prc-both' && modalImagesUser ? (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: device === 'mobile' ? 28 : device === 'tablet' ? 34 : '2vw',
                                    alignItems: 'center',
                                    position: 'relative',
                                    paddingTop: device === 'mobile' ? 12 : device === 'tablet' ? 24 : 38,
                                    paddingBottom: device === 'mobile' ? 16 : device === 'tablet' ? 28 : 34,
                                    width: device === 'mobile' ? '97vw' : device === 'tablet' ? '85vw' : '70vw',
                                    maxWidth: device === 'mobile' ? '96vw' : device === 'tablet' ? 1100 : 900,
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {[
                                    ['Front', modalImagesUser.prc_id_photo_front],
                                    ['Back', modalImagesUser.prc_id_photo_back],
                                ].map(([side, src]) => (
                                    <div
                                        key={side as string}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: '80%',
                                            maxWidth: device === 'mobile' ? '94vw' : device === 'tablet' ? 950 : 760,
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        <SubLabel device={device}>{side}</SubLabel>
                                        <img
                                            src={src ? `/storage/${src}` : '/images/placeholder-document.png'}
                                            alt={`PRC ID ${side}`}
                                            style={{
                                                width: '100%',
                                                maxWidth: device === 'mobile' ? '90vw' : device === 'tablet' ? 900 : 760,
                                                minWidth: 120,
                                                maxHeight: device === 'mobile' ? '34vh' : device === 'tablet' ? '44vh' : '36vh',
                                                borderRadius: 16,
                                                objectFit: 'contain',
                                                background: '#ededed',
                                                boxShadow: device === 'mobile' ? '0 4px 14px 0 rgba(0,0,0,0.13)' : '0 8px 18px 0 rgba(0,0,0,0.10)',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    position: 'relative',
                                    width: device === 'mobile' ? '96vw' : device === 'tablet' ? '84vw' : '70vw',
                                    maxWidth: device === 'mobile' ? '97vw' : device === 'tablet' ? 1100 : 900,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: device === 'mobile' ? 16 : device === 'tablet' ? 32 : 38,
                                    paddingBottom: device === 'mobile' ? 16 : device === 'tablet' ? 32 : 38,
                                }}
                            >
                                <img
                                    src={imageUrl || undefined}
                                    alt={title}
                                    style={{
                                        width: '100%',
                                        maxWidth: device === 'mobile' ? '92vw' : device === 'tablet' ? 1040 : 870,
                                        minWidth: 100,
                                        maxHeight: device === 'mobile' ? '70vh' : device === 'tablet' ? '76vh' : '80vh',
                                        borderRadius: imageUrl && imageUrl.toLowerCase().includes('payslip') ? 0 : 16,
                                        marginTop: device === 'mobile' ? 10 : device === 'tablet' ? 18 : 18,
                                        background: '#ededed',
                                        objectFit: 'contain',
                                        boxShadow: device === 'mobile' ? '0 4px 14px 0 rgba(0,0,0,0.13)' : '0 8px 16px 0 rgba(0,0,0,0.10)',
                                    }}
                                />
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenImageModal;
