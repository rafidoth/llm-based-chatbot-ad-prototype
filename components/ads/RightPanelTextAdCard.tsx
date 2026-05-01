"use client";

import { useAdTracking } from "@/hooks/useAdTracking";

interface RightPanelTextAdCardProps {
    product: {
        name: string;
        url: string;
        desc: string;
        category: string;
        headline: string;
        description: string;
        situationalContext: string;
        story: string;
    };
    messageId: string;
    sessionId: string;
    adMode: string;
}

export function RightPanelTextAdCard({
    product,
    messageId,
    sessionId,
    adMode,
}: RightPanelTextAdCardProps) {
    const { ref } = useAdTracking(product.name, sessionId, messageId, adMode);
    const headline = product.headline || product.name;
    const description = product.description || product.desc;

    return (
        <article ref={ref} className="rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Sponsored
            </p>
            <p className="text-sm font-semibold leading-snug text-zinc-100">{headline}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300">{description}</p>
            <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
                {product.name}
            </a>
        </article>
    );
}
