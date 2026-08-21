interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export default function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-6 py-12 text-center">
            {icon ?? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-gray-300">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
                </svg>
            )}
            <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
            </div>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}