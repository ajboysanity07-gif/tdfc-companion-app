import React, { useEffect, useState } from 'react';
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
    headerBg = '#f57979',
    headerColor = '#fff',
    toolbarContentRight,
    bodySx,
    bodyClassName,
    onToggle,
    titleSx,
}) => {
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [contentLeft, setContentLeft] = useState(0);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    useEffect(() => {
        if (!isDesktop) {
            setContentLeft(0);
            return;
        }
        
        const updateContentPosition = () => {
            // Try multiple approaches to find where content starts
            let leftPosition = 0;
            
            // Approach 1: Find sidebar and measure its width
            const sidebar = document.querySelector('[data-sidebar="sidebar"]');
            if (sidebar) {
                const sidebarRect = sidebar.getBoundingClientRect();
                leftPosition = sidebarRect.right + 16; // Add 16px for the sidebar's padding
            }
            
            // Approach 2: Fallback to finding main content wrapper
            if (leftPosition === 0) {
                const contentWrapper = document.querySelector('.flex.min-h-0.w-full.flex-1') ||
                                      document.querySelector('[class*="flex-1"]');
                if (contentWrapper) {
                    leftPosition = contentWrapper.getBoundingClientRect().left;
                }
            }
            
            console.log('Modal left position:', leftPosition);
            setContentLeft(leftPosition);
        };

        // Initial update with a small delay to ensure DOM is ready
        setTimeout(updateContentPosition, 100);
        
        const observer = new MutationObserver(updateContentPosition);
        const sidebar = document.querySelector('[data-sidebar="sidebar"]');
        const root = document.querySelector('[data-sidebar-wrapper]') || document.body;
        
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, subtree: true });
        }
        observer.observe(root, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });

        window.addEventListener('resize', updateContentPosition);
        
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateContentPosition);
        };
    }, [isDesktop]);

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
                                    className="fixed inset-0 bg-black/20 backdrop-blur-md"
                                    style={{ left: contentLeft, zIndex: 9999 }}
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
                                    className="fixed bg-background"
                                    style={{
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: contentLeft,
                                        zIndex: 10000,
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
                        className="shrink-0 flex items-center justify-between py-3 border-b"
                        style={{
                            backgroundColor: headerBg,
                            color: headerColor,
                            paddingRight: '16px',
                        }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-10 w-10"
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
