interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-red-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-medium text-red-700">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                    Try again
                </button>
            )}
        </div>
    );
}