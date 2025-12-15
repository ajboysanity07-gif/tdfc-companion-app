import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
    footer,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 px-4 py-10 sm:px-8 sm:py-12 flex items-center justify-center">
            <div className="mx-auto w-full max-w-[560px]">
                {(title || description) && (
                    <div className="mb-6 text-center">
                        {title && <h1 className="text-4xl font-extrabold tracking-tight text-[#F57979]">{title}</h1>}
                        {description && <p className="mt-3 text-[15px] leading-6 text-black/70">{description}</p>}
                    </div>
                )}

                <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                    className="rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-lg shadow-gray-900/5 backdrop-blur"
                >
                    {children}
                </motion.div>
                {footer && <div className="mt-4 text-center text-sm text-black/70">{footer}</div>}
            </div>
        </div>
    );
}
