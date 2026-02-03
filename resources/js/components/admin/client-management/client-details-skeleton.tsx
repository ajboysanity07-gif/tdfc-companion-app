export default function ClientDetailsSkeleton() {
    return (
        <>
            {/* Header section */}
            <div className="space-y-2">
                <div className="rounded bg-neutral-700 h-8 w-48 animate-pulse" />
                <div className="rounded bg-neutral-700 h-4 w-64 animate-pulse" />
            </div>

            {/* Profile card section */}
            <div className="rounded-2xl border border-neutral-700 p-4 space-y-4">
                {/* Status badge */}
                <div className="rounded-full bg-neutral-700 h-6 w-24 animate-pulse" />

                {/* Form fields */}
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-1">
                            <div className="rounded bg-neutral-700 h-4 w-20 animate-pulse" />
                            <div className="rounded bg-neutral-700 h-10 w-full animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row gap-2">
                <div className="rounded-lg bg-neutral-700 h-10 flex-1 animate-pulse" />
                <div className="rounded-lg bg-neutral-700 h-10 flex-1 animate-pulse" />
            </div>

            {/* Details section */}
            <div className="space-y-3">
                <div className="rounded bg-neutral-700 h-6 w-32 animate-pulse" />
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded bg-neutral-700 h-16 w-full animate-pulse" />
                    ))}
                </div>
            </div>
        </>
    );
}
