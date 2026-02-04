import React, { useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
    open: boolean;
    title: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    headerBg?: string;
    headerColor?: string;
    toolbarContentRight?: React.ReactNode;
    bodySx?: React.CSSProperties;
    paperSx?: React.CSSProperties;
    bodyClassName?: string;
    onToggle?: (open: boolean) => void;
    zIndex?: number;
    titleSx?: React.CSSProperties;
};

const FullScreenModalMobile: React.FC<Props> = ({
    open,
    title,
    onClose,
    children,
    headerBg = '#e14e4e',
    headerColor = '#fff',
    toolbarContentRight,
    bodySx,
    bodyClassName,
    onToggle,
    titleSx,
}) => {
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleClose = () => {
        setIsAnimating(true);
    };

    const handleAnimationComplete = () => {
        if (isAnimating) {
            setIsAnimating(false);
            onClose();
        }
    };

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (bodyClassName) {
            if (open) {
                document.body.classList.add(bodyClassName);
            } else {
                document.body.classList.remove(bodyClassName);
            }
        }
        onToggle?.(open);

        return () => {
            if (bodyClassName) {
                document.body.classList.remove(bodyClassName);
            }
        };
    }, [bodyClassName, onToggle, open]);

    const isOpen = open && !isAnimating;

    return (
        <DialogPrimitive.Root open={open} modal={false}>
            <DialogPrimitive.Portal>
                <AnimatePresence onExitComplete={handleAnimationComplete}>
                    {isOpen && (
                        <>
                            {/* Overlay */}
                            <DialogPrimitive.Overlay forceMount asChild>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md"
                                    onClick={handleClose}
                                />
                            </DialogPrimitive.Overlay>
                            {/* Content */}
                            <DialogPrimitive.Content forceMount asChild>
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                                    className="fixed z-50 bg-background"
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        width: '100vw',
                                        height: '100vh',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                    <VisuallyHidden>
                        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
                        <DialogPrimitive.Description>Modal dialog for viewing details</DialogPrimitive.Description>
                    </VisuallyHidden>
                    
                    {/* Header */}
                    <div
                        className="shrink-0 flex items-center justify-between px-4 py-3 border-b"
                        style={{
                            backgroundColor: headerBg,
                            color: headerColor,
                        }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-10 w-10 -ml-2"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <h2
                            className="flex-1 text-lg font-bold truncate ml-2"
                            style={{ ...titleSx, letterSpacing: '2px' }}
                        >
                            {title}
                        </h2>
                        {toolbarContentRight}
                    </div>

                    {/* Body */}
                    <div
                        className={cn(
                            'flex-1 overflow-y-auto w-full',
                            bodyClassName,
                        )}
                        style={{
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            paddingBottom: '4.5rem',
                            ...bodySx,
                        }}
                    >
                        {children}
                    </div>
                                </motion.div>
                            </DialogPrimitive.Content>
                        </>
                    )}
                </AnimatePresence>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

export default FullScreenModalMobile;
