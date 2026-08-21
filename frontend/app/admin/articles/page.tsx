"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { articleExcerpt } from "@/lib/articleFormat";

interface Article {
    id: string;
    title: string;
    content: string;
    coverImageUrl?: string;
    authorName?: string;
    createdAt: string;
}

function useAllArticles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        api
            .get("/articles")
            .then((res) => {
                if (!cancelled) setArticles(res.data as Article[]);
            })
            .catch(() => {
                if (!cancelled) setError("Couldn't load health articles right now.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { articles, loading, error };
}

export default function ArticlesPage() {
    const auth = useAuthGuard("PATIENT");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <ArticlesContent auth={auth} />;
}

function ArticlesContent({ auth }: { auth: { email: string; role: string } }) {
    const { articles, loading, error } = useAllArticles();

    return (
        <DashboardShell auth={auth} title="Health Articles">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Health Articles</h2>
                <Link
                    href="/dashboard"
                    className="text-sm font-medium text-emerald-600 hover:underline"
                >
                    ← Back to dashboard
                </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : articles.length === 0 ? (
                    <p className="text-sm text-gray-400">
                        No health articles published yet — check back soon.
                    </p>
                ) : (
                    articles.map((article) => (
                        <div
                            key={article.id}
                            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                        >
                            {article.coverImageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={article.coverImageUrl}
                                    alt=""
                                    className="h-32 w-full object-cover"
                                />
                            )}
                            <div className="p-5">
                                <h4 className="font-semibold text-gray-900">{article.title}</h4>
                                {article.authorName && (
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {article.authorName}
                                    </p>
                                )}
                                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                    {articleExcerpt(article.content, 110)}
                                </p>
                                <Link
                                    href={`/articles/${article.id}`}
                                    className="mt-3 inline-block text-xs font-medium text-emerald-600 hover:underline"
                                >
                                    Read more →
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardShell>
    );
}