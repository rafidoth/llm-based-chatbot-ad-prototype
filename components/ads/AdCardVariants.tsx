"use client";

import { ExternalLink, ArrowUpRight, MessageCircleQuestion, BookOpen } from "lucide-react";
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
        situationalContext: string;
        story: string;
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
// VARIANT 3: Story — product description as a mini-storyline
// ────────────────────────────────────────────────────────────────
function AdCardStory({ product }: AdCardVariantProps) {
    const headline = product.headline || product.name;
    const story = product.story || product.description || product.desc;

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
            <div className="space-y-2">
                <h4 className="text-[13px] font-semibold leading-snug text-zinc-100">
                    {headline}
                </h4>
                {/* Story block */}
                <div className="flex items-start gap-2.5 rounded-lg bg-zinc-800/40 px-3 py-2.5">
                    <BookOpen size={14} className="mt-0.5 shrink-0 text-amber-400/70" />
                    <p className="text-[12.5px] leading-relaxed text-zinc-300 italic">
                        {story}
                    </p>
                </div>
                <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-500">
                        {product.name}
                    </span>
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                        Explore
                        <ArrowUpRight size={12} />
                    </a>
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────
// VARIANT 4: Situational — pain-point context with product solution
// ────────────────────────────────────────────────────────────────
function AdCardSituational({ product }: AdCardVariantProps) {
    const headline = product.headline || product.name;
    const description = product.description || product.desc;
    const situationalContext = product.situationalContext || "";

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

            {/* Situational context block */}
            {situationalContext && (
                <div className="mb-3 flex items-start gap-2.5 rounded-lg bg-zinc-800/50 px-3 py-2.5">
                    <MessageCircleQuestion size={14} className="mt-0.5 shrink-0 text-emerald-400/70" />
                    <p className="text-[13px] leading-snug text-zinc-300 italic">
                        {situationalContext}
                    </p>
                </div>
            )}

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
                        Try it out
                        <ArrowUpRight size={12} />
                    </a>
                </div>
            </div>
        </div>
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
    AdCardStory,
    AdCardSituational,
];

/**
 * Named registry: maps a short key to each variant component and a
 * human-readable label (used in the profile modal multi-select).
 */
export const AD_CARD_VARIANT_MAP: Record<
    string,
    { component: ComponentType<AdCardVariantProps>; label: string; description: string }
> = {
    clean: { component: AdCardClean, label: "Clean", description: "Card with prominent headline" },
    inline: { component: AdCardInline, label: "Inline", description: "Compact horizontal format" },
    story: { component: AdCardStory, label: "Story", description: "Product description as a narrative mini-storyline" },
    situational: { component: AdCardSituational, label: "Situational", description: "Pain-point context with product solution" },
};

export const AD_CARD_VARIANT_KEYS = Object.keys(AD_CARD_VARIANT_MAP);
