"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useAdTracking } from "@/hooks/useAdTracking";
import { AD_CARD_VARIANTS } from "./AdCardVariants";

interface SponsoredAdCardProps {
    product: {
        name: string;
        url: string;
        desc: string;
        category: string;
        headline: string;
        description: string;
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

    // Pick a random variant once per mount
    const VariantComponent = useMemo(() => {
        const index = Math.floor(Math.random() * AD_CARD_VARIANTS.length);
        return AD_CARD_VARIANTS[index];
    }, []);

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

            {/* Render the randomly selected variant */}
            <VariantComponent product={product} />
        </div>
    );
}
