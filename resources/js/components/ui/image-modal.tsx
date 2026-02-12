import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';

type ImageModalProps = {
    open: boolean;
    onClose: () => void;
    images: Array<{
        src: string;
        label: string;
    }>;
};

const ImageModal: React.FC<ImageModalProps> = ({ open, onClose, images }) => {
    if (!open) return null;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onClose}>
            <DialogPrimitive.Portal container={document.body}>
                {/* Blurred backdrop */}
                <DialogPrimitive.Overlay
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                />
                {/* Content */}
                <DialogPrimitive.Content 
                    style={{ 
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10000,
                        outline: 'none',
                        overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        background: 'transparent'
                    }}
                >
                    <VisuallyHidden.Root>
                        <DialogPrimitive.Title>Image Viewer</DialogPrimitive.Title>
                        <DialogPrimitive.Description>View document images</DialogPrimitive.Description>
                    </VisuallyHidden.Root>
                    
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: '16px',
                            right: '16px',
                            zIndex: 10001,
                            padding: '8px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
                    >
                        <X style={{ width: '24px', height: '24px' }} />
                    </button>

                    {/* Images container */}
                    <div 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '100vh',
                            width: '100%',
                            padding: '64px 12px',
                            gap: '24px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <style>{`
                            @keyframes slideIn {
                                from { opacity: 0; transform: translateX(20px); }
                                to { opacity: 1; transform: translateX(0); }
                            }
                        `}</style>
                        {images.map((image, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    maxWidth: 'min(800px, 90vw)',
                                    width: '100%',
                                    animation: 'slideIn 240ms ease both',
                                }}
                            >
                                <div 
                                    style={{
                                        marginBottom: '4px',
                                        padding: '8px 16px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(4px)',
                                        WebkitBackdropFilter: 'blur(4px)',
                                    }}
                                >
                                    {image.label}
                                </div>
                                <img
                                    src={image.src}
                                    alt={image.label}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '65vh',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 18px 30px rgba(0, 0, 0, 0.32)',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

export default ImageModal;
