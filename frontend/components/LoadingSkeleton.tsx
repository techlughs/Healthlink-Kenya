export function CalendarSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-7 w-16 animate-pulse rounded-lg bg-gray-100" />
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-50 p-px">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="min-h-64px animate-pulse bg-white sm:min-h-84px" />
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg border border-gray-100 bg-gray-50" />
            ))}
        </div>
    );
}