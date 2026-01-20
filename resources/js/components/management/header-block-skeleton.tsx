export default function HeaderBlockSkeleton() {
    return (
        <div className="p-4 bg-[#0a0a0a]">
            <div className="relative overflow-hidden rounded-2xl bg-neutral-800 shadow-md animate-pulse">
                <div className="relative z-10 px-6 py-8">
                    <div className="mb-2 h-8 w-48 bg-neutral-700 rounded"></div>
                    <div className="inline-flex items-center gap-2 h-6 w-64 bg-neutral-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
