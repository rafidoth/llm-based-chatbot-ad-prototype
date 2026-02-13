"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { useAdTracking } from "@/hooks/useAdTracking";

interface SponsoredAdCardProps {
    product: {
        name: string;
        url: string;
        desc: string;
        category: string;
    };
    messageId: string;
    sessionId: string;
    adMode: string;
}

export function SponsoredAdCard({
    product,
    messageId,
    sessionId,
    adMode,
}: SponsoredAdCardProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const { ref, onDismiss } = useAdTracking(
        product.name,
        sessionId,
        messageId,
        adMode
    );

    if (isDismissed) return null;

    return (
        <div
            ref={ref}
            className="mt-3 mx-0 relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-[#2a2a2a] to-[#1e1e1e] p-4 shadow-lg shadow-amber-500/5 transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/10"
        >
            {/* Sponsored badge */}
            <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Sponsored
                </span>
                <button
                    onClick={() => {
                        setIsDismissed(true);
                        onDismiss();
                    }}
                    className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
                    aria-label="Dismiss ad"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Product info */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-100">{product.name}</h4>
                <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                    {product.desc}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                        {product.category}
                    </span>
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/30 hover:text-amber-200"
                    >
                        Learn More
                        <ExternalLink size={11} />
                    </a>
                </div>
            </div>
        </div>
    );
}
