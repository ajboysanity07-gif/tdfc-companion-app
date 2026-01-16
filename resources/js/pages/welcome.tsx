import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            {/* MOBILE (unchanged, smaller image) */}
            <div className="mx-auto grid min-h-screen place-items-center bg-white px-4 py-8 md:hidden">
                <div className="w-full max-w-[720px]">
                    <div className="mb-6 grid place-items-center">
                        <img src="/images/tdfc-icon.png" alt="TDFC Logo" className="w-full max-w-[180px] select-none" />
                    </div>

                    <div className="rounded-4xl bg-[#FFE57E] p-4 shadow">
                        <div className="grid gap-4">
                            <a
                                href="/register"
                                className="grid place-items-center rounded-card bg-[#F57979] py-3 text-xl font-extrabold text-white shadow"
                            >
                                REGISTER
                            </a>
                            <a
                                href="/login"
                                className="grid place-items-center rounded-card border-2 border-black/10 bg-white py-3 text-xl font-extrabold text-[#3B82F6] shadow"
                            >
                                LOGIN
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESKTOP/TABLET: card with colored top bar */}
            <div className="hidden min-h-screen place-items-center bg-gray-50 md:grid">
                <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
                    {/* Colored top strip */}
                    <div className="h-3 w-full bg-linear-to-r from-[#F57979] via-[#FFE57E] to-[#3B82F6]" />

                    {/* Card body */}
                    <div className="p-10">
                        <div className="mb-6 grid place-items-center">
                            <img src="/images/tdfc-icon.png" alt="TDFC Logo" className="w-full max-w-[260px] select-none" />
                        </div>

                        <div className="rounded-4xl bg-[#FFE57E] p-6 shadow-inner">
                            <div className="grid gap-6">
                                <Link
                                    href="/register"
                                    className="grid place-items-center rounded-card bg-[#F57979] py-4 text-xl font-extrabold text-white shadow transition-transform hover:scale-[1.01] hover:shadow-lg"
                                >
                                    REGISTER
                                </Link>
                                <Link
                                    href="/login"
                                    className="grid place-items-center rounded-card border-2 border-black/10 bg-white py-4 text-xl font-extrabold text-[#3B82F6] shadow transition-transform hover:scale-[1.01] hover:shadow-lg"
                                >
                                    LOGIN
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
