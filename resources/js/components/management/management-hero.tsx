type ManagementHeroProps = {
    title: string;
    subtitle: string;
};

export default function ManagementHero({ title, subtitle }: ManagementHeroProps) {
    return (
        <div className="p-4">
            <div className="relative h-[180px] overflow-hidden rounded-xl bg-[#F57979] shadow-lg">
                <div className="relative z-10 p-6">
                    <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#FFF172]">{title}</h1>
                    <div className="text-[1.08rem] font-medium text-white opacity-90">{subtitle}</div>
                </div>
            </div>
        </div>
    );
}
