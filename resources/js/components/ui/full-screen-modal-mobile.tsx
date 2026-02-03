import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useOptionalSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

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
    const sidebar = useOptionalSidebar();
    const isSidebarMobile = sidebar?.isMobile ?? true;
    const sidebarState = sidebar?.state ?? 'expanded';
    const sidebarWidth = isSidebarMobile ? '0px' : (sidebarState === 'expanded' ? '16rem' : '4rem');
    const isCollapsed = !isSidebarMobile && sidebarState === 'collapsed';

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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent 
                className={cn(
                    'fixed inset-0 max-w-none max-h-none border-0 rounded-0 p-0 data-[state=open]:slide-in-from-bottom-full',
                    !isSidebarMobile && `left-[${sidebarWidth}] w-[calc(100%-${sidebarWidth})]`,
                    'bottom-[68px] md:bottom-0 h-[calc(100%-68px)] md:h-full',
                )}
            >
                <div
                    className="flex flex-col h-full bg-background"
                    style={{
                        left: isSidebarMobile ? 0 : sidebarWidth,
                        width: isSidebarMobile ? '100%' : `calc(100% - ${sidebarWidth})`,
                    }}
                >
                    {/* Header */}
                    <div
                        className="sticky top-0 flex items-center justify-between px-2 md:px-0 py-0 border-b md:pl-0 md:pr-0"
                        style={{
                            backgroundColor: headerBg,
                            color: headerColor,
                        }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-12 w-12 md:ml-2"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <h2
                            className="flex-1 text-base sm:text-xl font-extrabold truncate overflow-hidden text-ellipsis ml-2"
                            style={titleSx}
                        >
                            {title}
                        </h2>
                        {toolbarContentRight}
                    </div>

                    {/* Body */}
                    <div
                        className={cn(
                            'flex-1 overflow-y-auto px-2.5 sm:px-3.5 py-2.5 sm:py-3.5 pb-5 sm:pb-6 w-full',
                            bodyClassName,
                        )}
                        style={bodySx}
                    >
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FullScreenModalMobile;
