"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
    AD_CARD_VARIANT_MAP,
    AD_CARD_VARIANT_KEYS,
    type AdCardVariantProps,
} from "@/components/ads/AdCardVariants";

interface Product {
    name: string;
    url: string;
    desc: string;
    category: string;
}

/** Fake AI-generated ad copy derived from the product for demo purposes. */
function buildAdProduct(product: Product): AdCardVariantProps["product"] {
    return {
        name: product.name,
        url: product.url,
        desc: product.desc,
        category: product.category,
        headline: `Discover ${product.name} — The smarter choice`,
        description: product.desc,
        situationalContext: `Looking for the best option in ${product.category}? Many people struggle to find reliable solutions.`,
    };
}

export default function AdVariantsPage() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchRandomProduct() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/products/random");
            if (!res.ok) throw new Error("Failed to fetch product");
            const data: Product = await res.json();
            setProduct(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRandomProduct();
    }, []);

    const adProduct = product ? buildAdProduct(product) : null;

    return (
        <div className="min-h-screen bg-[#212121] text-zinc-100">
            {/* Header */}
            <div className="mx-auto max-w-3xl px-6 pt-12 pb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Ad Card Variants
                    </h1>
                    <button
                        onClick={fetchRandomProduct}
                        disabled={loading}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700/50 bg-[#1e1e1e] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600/50 hover:text-zinc-100 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={13}
                            className={loading ? "animate-spin" : ""}
                        />
                        Random Product
                    </button>
                </div>
                <p className="text-sm text-zinc-500">
                    Preview of all ad card styles using a randomly selected
                    product from the catalog.
                </p>

                {/* Product info pill */}
                {product && !loading && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-700/40 bg-[#1a1a1a] px-4 py-1.5">
                        <span className="text-xs text-zinc-400">
                            Product:
                        </span>
                        <span className="text-xs font-medium text-zinc-200">
                            {product.name}
                        </span>
                        <span className="text-zinc-700">|</span>
                        <span className="text-xs text-zinc-500">
                            {product.category}
                        </span>
                    </div>
                )}
            </div>

            {/* Variants grid */}
            <div className="mx-auto max-w-3xl px-6 pb-16">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw
                            size={20}
                            className="animate-spin text-zinc-500"
                        />
                    </div>
                )}

                {error && (
                    <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {adProduct && !loading && (
                    <div className="space-y-10">
                        {AD_CARD_VARIANT_KEYS.map((key) => {
                            const { component: Variant, label, description } =
                                AD_CARD_VARIANT_MAP[key];
                            return (
                                <section key={key}>
                                    <div className="mb-3">
                                        <h2 className="text-sm font-semibold text-zinc-200">
                                            {label}
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            {description}
                                        </p>
                                    </div>
                                    <Variant product={adProduct} />
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
