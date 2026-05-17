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
    const category = product.category || "Sponsored";

    return (
        <article
            ref={ref}
            className="group relative overflow-hidden rounded-xl border border-zinc-700/55 bg-zinc-900 p-3.5 shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/35 xl:bg-gradient-to-b xl:from-zinc-900/70 xl:to-zinc-900/50"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex rounded-full border border-zinc-600/60 bg-zinc-800/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-300">
                    {category}
                </span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    Ad
                </span>
            </div>
            <p className="text-sm font-semibold leading-snug text-zinc-100">{headline}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">{description}</p>
            <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors group-hover:text-emerald-300"
            >
                Explore {product.name}
            </a>
        </article>
    );
}
