"use client";

import { ArrowUpRight } from "lucide-react";
import { ComponentType, useState } from "react";

/**
 * Props shared by all ad card variants.
 * Every variant receives the same data — only styling differs.
 */
export interface AdCardVariantProps {
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
}

function AdCardNormal({ product }: AdCardVariantProps) {
    const headline = product.headline || product.name;
    const description = product.description || product.desc;

    return (
        <div className="rounded-2xl border border-sky-300/20 bg-gradient-to-br from-slate-900/45 via-sky-950/35 to-cyan-950/30 p-4 backdrop-blur-md shadow-lg shadow-sky-900/15 transition-all duration-200 hover:border-sky-200/35 hover:shadow-sky-900/30">
            <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full border border-yellow-300/30 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-yellow-200/90">
                    Sponsored
                </span>
                <span className="text-slate-300/50">·</span>
                <span className="text-[10px] uppercase tracking-wide text-sky-100/75">
                    {product.category}
                </span>
            </div>
            <div className="space-y-1.5">
                <h4 className="text-[25px] font-bold leading-snug text-slate-50">
                    {headline}
                </h4>
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-100/90">
                    {description}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-medium text-sky-100/60">
                        {product.name}
                    </span>
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-sky-200/35 bg-sky-300/10 px-2.5 py-1 text-xs font-semibold text-sky-100 transition-all hover:border-emerald-200/50 hover:bg-emerald-300/15 hover:text-emerald-100"
                    >
                        Learn more
                        <ArrowUpRight size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
}

function AdCardInline({ product }: AdCardVariantProps) {
    const [showCard, setShowCard] = useState(false);
    const headline = product.headline || product.name;
    const description = product.description || product.desc;
    const productName = product.name;

    return (
        <div className="relative my-1">
            {/* Simple inline paragraph */}
            <p className="text-sm text-zinc-300 leading-relaxed">
                {headline} —{" "}
                <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setShowCard(true)}
                    onMouseLeave={() => setShowCard(false)}
                    className="font-bold text-emerald-400 cursor-pointer transition-colors duration-200 hover:text-emerald-300 hover:underline"
                >
                    {productName}
                </a>
                {" · "}
                <span className="text-zinc-400">{description}</span>
                <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    Sponsored
                </span>
            </p>

            {/* Card shown on hover */}
            {showCard && (
                <div
                    onMouseEnter={() => setShowCard(true)}
                    onMouseLeave={() => setShowCard(false)}
                    className="mt-2 rounded-lg border border-sky-400/35 bg-gradient-to-br from-sky-900/70 via-blue-900/65 to-cyan-900/55 px-4 py-3 shadow-lg shadow-sky-900/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-sky-200/70">
                            Sponsored
                        </span>
                    </div>
                    <p className="text-[18px] font-bold text-white mb-1">
                        {productName}
                    </p>
                    <p className="text-[14px] font-semibold text-sky-100 leading-snug mb-1">
                        {headline}
                    </p>
                    <p className="text-sm text-zinc-100/90 leading-relaxed mb-3">
                        {description}
                    </p>
                </div>
            )}
        </div>
    );
}

export type OutRespAdMode = "out-resp-normal" | "out-resp-inline" | "out-panel-right";

export const OUT_RESP_MODE_COMPONENT_MAP: Record<OutRespAdMode | "out-resp", ComponentType<AdCardVariantProps>> = {
    "out-resp-normal": AdCardNormal,
    "out-resp-inline": AdCardInline,
    "out-panel-right": AdCardNormal,
    "out-resp": AdCardNormal,
};

export const OUT_RESP_MODE_META: Record<OutRespAdMode, { label: string; description: string }> = {
    "out-resp-normal": {
        label: "Out-Resp Normal",
        description: "Standard sponsored card below response",
    },
    "out-resp-inline": {
        label: "Out-Resp Inline",
        description: "Inline sponsored mention below response",
    },
    "out-panel-right": {
        label: "Out-Panel Right",
        description: "Sponsored card shown in right-side ad panel",
    },
};

export const OUT_RESP_MODE_KEYS: OutRespAdMode[] = ["out-resp-normal", "out-resp-inline", "out-panel-right"];
