"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import DashboardShell, { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import { renderArticleContent } from "@/lib/articleFormat";

interface Article {
    id: string;
    title: string;
    content: string;
    coverImageUrl?: string;
    authorName?: string;
    createdAt: string;
}

export default function ArticleReaderPage() {
    const auth = useAuthGuard("PATIENT");
    const params = useParams<{ id: string }>();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!auth || !params?.id) return;

        let cancelled = false;

        api
            .get(`/articles/${params.id}`)
            .then((res) => {
                if (!cancelled) setArticle(res.data);
            })
            .catch(() => {
                if (!cancelled) setError("Couldn't load this article.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [auth, params?.id]);

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return (
        <DashboardShell auth={auth} title="Health Articles">
            <Link href="/articles" className="text-sm font-medium text-emerald-600 hover:underline">
                ← Back to articles
            </Link>

            {error && (
                <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</p>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-gray-400">Loading…</p>
            ) : article ? (
                <article className="mt-4 max-w-2xl">
                    {article.coverImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={article.coverImageUrl}
                            alt=""
                            className="mb-5 h-56 w-full rounded-xl object-cover"
                        />
                    )}
                    <h1 className="text-2xl font-semibold text-gray-900">{article.title}</h1>
                    {article.authorName && (
                        <p className="mt-1 text-xs text-gray-400">By {article.authorName}</p>
                    )}
                    <div
                        className="prose prose-sm mt-5 max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }}
                    />
                </article>
            ) : null}
        </DashboardShell>
    );
}