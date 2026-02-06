import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { type PropsWithChildren, type ReactNode } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
    descriptionClassName,
    align = 'center',
    cardMotionKey,
    cardMotionProps,
    footer,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: ReactNode;
    descriptionClassName?: string;
    align?: 'center' | 'start';
    cardMotionKey?: string | number;
    cardMotionProps?: MotionProps;
    footer?: React.ReactNode;
}>) {
    const alignClass = align === 'start' ? 'items-start' : 'items-center';
    const mergedCardMotion: MotionProps = {
        layout: true,
        transition: { type: 'spring', stiffness: 160, damping: 22 },
        ...cardMotionProps,
    };

    return (
        <div className={`h-screen overflow-hidden bg-linear-to-br from-gray-100 via-white to-gray-200 px-6 py-6 sm:px-4 sm:py-10 flex ${alignClass} justify-center`}>
            <div className="mx-auto w-full max-w-[320px] sm:max-w-[560px]">
                {(title || description) && (
                    <div className="mb-4 sm:mb-6 text-center">
                        {title && <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F57979]">{title}</h1>}
                        {description && (
                            <p className={`mt-3 text-[15px] leading-6 text-black/70${descriptionClassName ? ` ${descriptionClassName}` : ''}`}>
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {cardMotionKey !== undefined ? (
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={cardMotionKey}
                            {...mergedCardMotion}
                            className="rounded-2xl border border-gray-200 bg-white/95 p-5 sm:p-8 shadow-lg shadow-gray-900/5 backdrop-blur"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <motion.div
                        {...mergedCardMotion}
                        className="rounded-2xl border border-gray-200 bg-white/95 p-5 sm:p-8 shadow-lg shadow-gray-900/5 backdrop-blur"
                    >
                        {children}
                    </motion.div>
                )}
                {footer && <div className="mt-4 text-center text-sm text-black/70">{footer}</div>}
            </div>
        </div>
    );
}
