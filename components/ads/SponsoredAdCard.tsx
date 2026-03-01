"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useAdTracking } from "@/hooks/useAdTracking";
import { AD_CARD_VARIANTS, AD_CARD_VARIANT_MAP } from "./AdCardVariants";

interface SponsoredAdCardProps {
    product: {
        name: string;
        url: string;
        desc: string;
        category: string;
        headline: string;
        description: string;
        situationalContext: string;
    };
    messageId: string;
    sessionId: string;
    adMode: string;
    /** User-selected variant keys for ordered cycling (e.g. ["clean", "situational"]) */
    selectedVariants?: string[];
    /** 0-based index of this out-resp ad among all out-resp messages, used for ordered cycling */
    outRespIndex?: number;
}

export function SponsoredAdCard({
    product,
    messageId,
    sessionId,
    adMode,
    selectedVariants,
    outRespIndex,
}: SponsoredAdCardProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const { ref, onDismiss } = useAdTracking(
        product.name,
        sessionId,
        messageId,
        adMode
    );

    // Determine variant: ordered cycling through user-selected variants, or random fallback
    const VariantComponent = useMemo(() => {
        if (selectedVariants && selectedVariants.length > 0 && outRespIndex !== undefined) {
            const key = selectedVariants[outRespIndex % selectedVariants.length];
            const entry = AD_CARD_VARIANT_MAP[key];
            if (entry) return entry.component;
        }
        // Fallback: random from all variants
        const index = Math.floor(Math.random() * AD_CARD_VARIANTS.length);
        return AD_CARD_VARIANTS[index];
    }, [selectedVariants, outRespIndex]);

    if (isDismissed) return null;

    return (
        <div ref={ref} className="mt-3 mx-0 relative">
            {/* Dismiss button (shared across all variants) */}
            <button
                onClick={() => {
                    setIsDismissed(true);
                    onDismiss();
                }}
                className="absolute top-2.5 right-2.5 z-10 cursor-pointer rounded-md p-0.5 text-zinc-600 transition-colors hover:bg-zinc-700/50 hover:text-zinc-400"
                aria-label="Dismiss ad"
            >
                <X size={13} />
            </button>

            {/* Render the selected variant */}
            <VariantComponent product={product} />
        </div>
    );
}
