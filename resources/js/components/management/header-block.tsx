import { useMyTheme } from '@/hooks/use-mytheme';

type HeaderBlockProps = {
    title: string;
    subtitle: string;
};

export default function HeaderBlock({ title, subtitle }: HeaderBlockProps) {
    const tw = useMyTheme();
    
    return (
        <div className="p-4" style={{ backgroundColor: tw.isDark ? '#0a0a0a' : '#FFFFFF' }}>
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#F57979] to-[#e66767] shadow-md">
                <div className="relative z-10 px-6 py-8">
                    <h1 className="mb-2 text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {subtitle}
                    </div>
                </div>
            </div>
        </div>
    );
}