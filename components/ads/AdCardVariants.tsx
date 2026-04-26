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
        <div className="rounded-xl border border-zinc-700/40 bg-[#1e1e1e] p-4 transition-colors duration-200 hover:border-zinc-600/50">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Sponsored
                </span>
                <span className="text-zinc-700">·</span>
                <span className="text-[10px] text-zinc-600">
                    {product.category}
                </span>
            </div>
            <div className="space-y-1.5">
                <h4 className="text-[13px] font-semibold leading-snug text-zinc-100">
                    {headline}
                </h4>
                <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                    {description}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-500">
                        {product.name}
                    </span>
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
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
                    className="mt-2 rounded-lg border border-zinc-800/60 bg-[#1a1a1a] px-4 py-3 shadow-lg shadow-black/20 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                            Sponsored
                        </span>
                    </div>
                    <p className="text-[15px] font-semibold text-zinc-100 mb-1">
                        {productName}
                    </p>
                    <p className="text-[13px] font-medium text-zinc-300 leading-snug mb-1">
                        {headline}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {description}
                    </p>
                </div>
            )}
        </div>
    );
}

export type OutRespAdMode = "out-resp-normal" | "out-resp-inline";

export const OUT_RESP_MODE_COMPONENT_MAP: Record<OutRespAdMode | "out-resp", ComponentType<AdCardVariantProps>> = {
    "out-resp-normal": AdCardNormal,
    "out-resp-inline": AdCardInline,
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
};

export const OUT_RESP_MODE_KEYS: OutRespAdMode[] = ["out-resp-normal", "out-resp-inline"];
