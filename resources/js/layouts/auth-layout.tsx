import React from 'react';

type Props = {
    children: React.ReactNode;
    title?: string;
    description?: string;
};

// Full-bleed auth shell that matches the current register/login look (soft gradient, centered content).
export default function AuthLayout({ children, title, description }: Props) {
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 px-4 py-10 sm:px-8 sm:py-12">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
                {(title || description) && (
                    <div className="mx-auto mb-6 max-w-2xl text-center">
                        {title && <h1 className="text-4xl font-extrabold tracking-tight text-[#F57979]">{title}</h1>}
                        {description && <p className="mt-3 text-base leading-6 text-black/70">{description}</p>}
                    </div>
                )}

                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
