"use client";

import { ExternalLink, ArrowUpRight } from "lucide-react";
import { ComponentType } from "react";

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
    };
}

// ────────────────────────────────────────────────────────────────
// VARIANT 1: Clean — card with AI headline prominently displayed
// ────────────────────────────────────────────────────────────────
function AdCardClean({ product }: AdCardVariantProps) {
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

// ────────────────────────────────────────────────────────────────
// VARIANT 2: Inline — compact format with catchy headline
// ────────────────────────────────────────────────────────────────
function AdCardInline({ product }: AdCardVariantProps) {
    const headline = product.headline || product.name;
    const description = product.description || product.desc;

    return (
        <div className="rounded-lg border border-zinc-800/60 bg-[#1a1a1a] px-4 py-3 transition-colors duration-200 hover:border-zinc-700/50">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                            Sponsored
                        </span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-600">
                            {product.name}
                        </span>
                    </div>
                    <p className="text-[13px] font-medium text-zinc-200 leading-snug mb-0.5">
                        {headline}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-1">
                        {description}
                    </p>
                </div>
                <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 mt-3 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    Visit&nbsp;→
                </a>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────
// VARIANT 3: Contextual — recommendation-style clickable card
// ────────────────────────────────────────────────────────────────
function AdCardContextual({ product }: AdCardVariantProps) {
    const headline = product.headline || product.name;
    const description = product.description || product.desc;

    return (
        <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-zinc-700/40 bg-[#1e1e1e] p-4 transition-colors duration-200 hover:border-zinc-600/50 hover:bg-[#222222] cursor-pointer"
        >
            <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Suggested
                </span>
                <span className="text-zinc-700">·</span>
                <span className="text-[10px] text-zinc-600">
                    {product.category}
                </span>
            </div>
            <h4 className="text-[13px] font-semibold leading-snug text-zinc-100 mb-1.5">
                {headline}
            </h4>
            <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2 mb-3">
                {description}
            </p>
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                    {product.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    Learn more
                    <ExternalLink size={11} />
                </span>
            </div>
        </a>
    );
}

// ────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// Add your custom variant to this array and it will be
// randomly selected alongside the others.
// ────────────────────────────────────────────────────────────────
export const AD_CARD_VARIANTS: ComponentType<AdCardVariantProps>[] = [
    AdCardClean,
    AdCardInline,
    AdCardContextual,
];
