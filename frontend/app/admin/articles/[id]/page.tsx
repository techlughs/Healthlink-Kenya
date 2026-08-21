"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard, DashboardSkeleton } from "@/components/DashboardShell";
import DashboardShell from "@/components/DashboardShell";
import api from "@/lib/api";
import { renderArticleContent } from "@/lib/articleFormat";

interface Article {
    id: string;
    title: string;
    content: string;
    coverImageUrl?: string;
    authorName?: string;
    createdAt: string;
}

function useArticle(id: string) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const lastRequestedId = useRef<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        const isNewId = lastRequestedId.current !== id;
        lastRequestedId.current = id;

        api
            .get(`/articles/${id}`)
            .then((res) => {
                if (cancelled) return;
                setArticle(res.data as Article);
                setError("");
            })
            .catch(() => {
                if (cancelled) return;
                setError("This article couldn't be found.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            if (isNewId) setLoading(true);
        };
    }, [id]);

    return { article, loading, error };
}

export default function ArticleReaderPage() {
    const auth = useAuthGuard("PATIENT");

    if (!auth) {
        return <DashboardSkeleton />;
    }

    return <ArticleReaderContent auth={auth} />;
}

function ArticleReaderContent({ auth }: { auth: { email: string; role: string } }) {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { article, loading, error } = useArticle(params.id);

    return (
        <DashboardShell auth={auth} title="Article">
            <Link
                href="/dashboard"
                className="text-sm font-medium text-emerald-600 hover:underline"
            >
                ← Back to Dashboard
            </Link>

            <div className="mt-4">
                {loading ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : error ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <p className="text-sm text-red-500">{error}</p>
                        <button
                            onClick={() => router.push("/articles")}
                            className="mt-3 text-xs font-medium text-emerald-600 hover:underline"
                        >
                            Back to all articles
                        </button>
                    </div>
                ) : article ? (
                    <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        {article.coverImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={article.coverImageUrl}
                                alt=""
                                className="h-56 w-full object-cover"
                            />
                        )}
                        <div className="p-8">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {article.title}
                            </h1>
                            <p className="mt-1 text-xs text-gray-400">
                                {article.authorName ?? "HealthLink Kenya"} ·{" "}
                                {new Date(article.createdAt).toLocaleDateString()}
                            </p>
                            <div
                                className="mt-6"
                                dangerouslySetInnerHTML={{
                                    __html: renderArticleContent(article.content),
                                }}
                            />
                        </div>
                    </article>
                ) : null}
            </div>
        </DashboardShell>
    );
}