// Minimal, dependency-free "rich formatting" for article content.
// Admins write with a small set of markdown-style tokens (inserted via the
// toolbar in the admin editor); this renders them to safe HTML for the
// patient-side reader. Raw input is HTML-escaped first, so nothing a user
// types can inject markup — only the specific patterns below are turned
// into tags.
//
// Tailwind's preflight strips default browser styling from h1/h2/h3/ul/li,
// so classes are baked in directly here rather than relying on a `prose`
// wrapper (which does nothing unless @tailwindcss/typography is installed).

function escapeHtml(raw: string): string {
    return raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderInline(line: string): string {
    return line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
}

export function renderArticleContent(raw: string): string {
    const escaped = escapeHtml(raw);
    const lines = escaped.split(/\r?\n/);

    const htmlParts: string[] = [];
    let listBuffer: string[] = [];

    function flushList() {
        if (listBuffer.length > 0) {
            htmlParts.push(
                `<ul class="mb-4 list-disc space-y-1.5 pl-5 text-gray-700">${listBuffer.join("")}</ul>`
            );
            listBuffer = [];
        }
    }

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === "") {
            flushList();
            continue;
        }

        if (trimmed.startsWith("### ")) {
            flushList();
            htmlParts.push(
                `<h3 class="mb-2 mt-5 text-lg font-semibold text-gray-900">${renderInline(trimmed.slice(4))}</h3>`
            );
        } else if (trimmed.startsWith("## ")) {
            flushList();
            htmlParts.push(
                `<h2 class="mb-2 mt-6 text-xl font-semibold text-gray-900">${renderInline(trimmed.slice(3))}</h2>`
            );
        } else if (trimmed.startsWith("# ")) {
            flushList();
            htmlParts.push(
                `<h1 class="mb-3 mt-6 text-2xl font-semibold text-gray-900">${renderInline(trimmed.slice(2))}</h1>`
            );
        } else if (trimmed.startsWith("- ")) {
            listBuffer.push(`<li>${renderInline(trimmed.slice(2))}</li>`);
        } else {
            flushList();
            htmlParts.push(
                `<p class="mb-4 leading-relaxed text-gray-700">${renderInline(trimmed)}</p>`
            );
        }
    }

    flushList();
    return htmlParts.join("");
}

export function articleExcerpt(raw: string, maxLength = 160): string {
    const plain = raw
        .replace(/^#{1,3}\s+/gm, "")
        .replace(/^-\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/\r?\n+/g, " ")
        .trim();

    if (plain.length <= maxLength) {
        return plain;
    }
    return plain.slice(0, maxLength).trimEnd() + "…";
}