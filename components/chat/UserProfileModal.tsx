"use client";

import { useState, useEffect } from "react";
import { Check, Settings, SquareCheck, Square } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { AD_CARD_VARIANT_MAP, AD_CARD_VARIANT_KEYS } from "@/components/ads/AdCardVariants";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    onAdCardVariantsChange?: (variants: string[]) => void;
}

const AD_TURN_OPTIONS = [
    {
        value: "randomized",
        label: "Randomized",
        description: "Random ad mode each turn",
    },
    {
        value: "ordered",
        label: "Ordered",
        description: "Cycle through modes sequentially",
    },
    {
        value: "only-in-resp",
        label: "Only IN-RESP",
        description: "Always embed ads in responses",
    },
    {
        value: "only-out-resp",
        label: "Only OUT-RESP",
        description: "Always show ads below responses",
    },
] as const;

export function UserProfileModal({
    isOpen,
    onClose,
    userName,
    userEmail,
    onAdCardVariantsChange,
}: UserProfileModalProps) {
    const [adTurnMode, setAdTurnMode] = useState("randomized");
    const [selectedVariants, setSelectedVariants] = useState<string[]>([...AD_CARD_VARIANT_KEYS]);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Fetch current preference on open
    useEffect(() => {
        if (!isOpen) return;
        fetch("/api/user/preferences")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user?.adTurnMode) {
                    setAdTurnMode(data.user.adTurnMode);
                }
                if (data?.user?.adCardVariants) {
                    try {
                        const parsed = JSON.parse(data.user.adCardVariants);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setSelectedVariants(parsed);
                        }
                    } catch {
                        // ignore parse errors, keep default
                    }
                }
            })
            .catch(console.error);
    }, [isOpen]);

    const handleSaveTurnMode = async (value: string) => {
        setAdTurnMode(value);
        setIsSaving(true);
        setSaved(false);

        try {
            const res = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adTurnMode: value }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (e) {
            console.error("Failed to save preference:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleVariant = async (key: string) => {
        const isSelected = selectedVariants.includes(key);
        // Prevent deselecting the last variant
        if (isSelected && selectedVariants.length <= 1) return;

        const updated = isSelected
            ? selectedVariants.filter((v) => v !== key)
            : [...selectedVariants, key];

        setSelectedVariants(updated);
        setIsSaving(true);
        setSaved(false);

        try {
            const res = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adCardVariants: updated }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                onAdCardVariantsChange?.(updated);
            }
        } catch (e) {
            console.error("Failed to save variant preference:", e);
        } finally {
            setIsSaving(false);
        }
    };

    // Hide variant selector when only-in-resp is chosen (in-resp never shows card variants)
    const showVariantSelector = adTurnMode !== "only-in-resp";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1e1e1e] border-zinc-700/50 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-zinc-100">
                        <Settings size={18} className="text-zinc-400" />
                        User Profile
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Manage your profile and ad preferences.
                    </DialogDescription>
                </DialogHeader>

                {/* User Info */}
                <div className="flex items-center gap-4 py-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100">{userName}</p>
                        <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
                    </div>
                    {saved && (
                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-400">
                            <Check size={12} />
                            Saved
                        </span>
                    )}
                </div>

                {/* Separator */}
                <div className="border-t border-zinc-700/30" />

                {/* Ad Schedule + Card Styles — inline side by side */}
                <div className={`grid gap-4 ${showVariantSelector ? "grid-cols-2" : "grid-cols-1"}`}>
                    {/* Ad Turn Mode */}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-200 mb-2">
                            Ad Schedule Mode
                        </h3>

                        <div className="space-y-1.5">
                            {AD_TURN_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSaveTurnMode(option.value)}
                                    disabled={isSaving}
                                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-200 ${adTurnMode === option.value
                                        ? "bg-violet-500/15 border border-violet-500/40 shadow-sm shadow-violet-500/5"
                                        : "border border-zinc-700/30 hover:bg-zinc-800/50 hover:border-zinc-600/40"
                                        }`}
                                >
                                    {/* Radio indicator */}
                                    <div
                                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${adTurnMode === option.value
                                            ? "border-violet-400 bg-violet-400"
                                            : "border-zinc-600"
                                            }`}
                                    >
                                        {adTurnMode === option.value && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p
                                            className={`text-xs font-medium ${adTurnMode === option.value
                                                ? "text-violet-200"
                                                : "text-zinc-300"
                                                }`}
                                        >
                                            {option.label}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 leading-tight">
                                            {option.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ad Card Variant Selector — hidden when only-in-resp */}
                    {showVariantSelector && (
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-200 mb-2">
                                Ad Card Styles
                            </h3>

                            <div className="space-y-1.5">
                                {AD_CARD_VARIANT_KEYS.map((key) => {
                                    const variant = AD_CARD_VARIANT_MAP[key];
                                    const isSelected = selectedVariants.includes(key);
                                    const isLastSelected = isSelected && selectedVariants.length <= 1;

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleToggleVariant(key)}
                                            disabled={isSaving || isLastSelected}
                                            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-200 ${isSelected
                                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                                : "border border-zinc-700/30 hover:bg-zinc-800/50 hover:border-zinc-600/40"
                                                } ${isLastSelected ? "opacity-60 cursor-not-allowed" : ""}`}
                                        >
                                            {/* Checkbox indicator */}
                                            {isSelected ? (
                                                <SquareCheck size={14} className="shrink-0 text-emerald-400" />
                                            ) : (
                                                <Square size={14} className="shrink-0 text-zinc-600" />
                                            )}

                                            <div className="min-w-0">
                                                <p
                                                    className={`text-xs font-medium ${isSelected
                                                        ? "text-emerald-200"
                                                        : "text-zinc-300"
                                                        }`}
                                                >
                                                    {variant.label}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 leading-tight">
                                                    {variant.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
