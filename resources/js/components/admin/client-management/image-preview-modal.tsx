import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

type PreviewImage = { src: string; label?: string };

type Props = {
    open: boolean;
    title?: string;
    images: PreviewImage[];
    onClose: () => void;
};

const ImagePreviewModal: React.FC<Props> = ({ open, title, images, onClose }) => {
    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'rgba(28, 28, 28, 0.92)',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    borderRadius: '16px',
                    maxWidth: '540px',
                    width: '100%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight: '8px',
                        paddingLeft: '24px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 800,
                        }}
                    >
                        {title || 'Preview'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            borderRadius: '4px',
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '24px',
                        flex: 1,
                        overflow: 'auto',
                    }}
                >
                    {images.map((img) => (
                        <img
                            key={img.src}
                            src={img.src}
                            alt={img.label || title}
                            style={{
                                width: '100%',
                                maxHeight: '420px',
                                objectFit: 'contain',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
                                backgroundColor: '#262626',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;
