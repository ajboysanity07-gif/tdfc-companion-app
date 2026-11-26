import { ReactNode } from 'react';

type Props = { title: string; lead?: string; wide?: boolean; footer?: ReactNode; children: ReactNode };

/** Page shell + white card shared by the auth screens (logo, title, lead, card, footer line). */
export default function AuthCard({ title, lead, wide, footer, children }: Props) {
    return (
        <main className="grid min-h-screen place-items-center bg-linear-to-br from-tdfc-page-from via-white to-tdfc-page-to px-4 py-8 dark:via-background">
            <div className={`w-full ${wide ? 'max-w-[560px]' : 'max-w-[420px]'}`}>
                <img src="/images/logo.png" alt="TDFC" className="mx-auto mb-5 h-11 w-auto" />
                <h1 className="text-center text-[32px] font-extrabold tracking-tight text-tdfc-coral-ink sm:text-4xl">{title}</h1>
                {lead && <p className="mx-auto mt-3 max-w-[44ch] text-center text-[15px] leading-normal text-foreground/70">{lead}</p>}
                <div className="mt-6 rounded-tdfc-card border border-tdfc-card-line bg-card px-[18px] py-6 shadow-tdfc-card sm:px-[22px] sm:py-7">
                    {children}
                </div>
                {footer && <p className="mt-4 text-center text-sm text-foreground/70">{footer}</p>}
            </div>
        </main>
    );
}

export const linkClass =
    'font-semibold text-tdfc-coral-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tdfc-coral-ink';
