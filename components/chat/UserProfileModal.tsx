"use client";

import { useState, useEffect } from "react";
import { Check, PanelRight, Settings } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeConversationId: string | null;
    rightAdPanel: boolean;
    isSavingRightAdPanel: boolean;
    onToggleRightAdPanel: () => void;
    userName: string;
    userEmail: string;
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
        value: "only-out-resp-normal",
        label: "Only OUT-RESP Normal",
        description: "Always show standard ad cards",
    },
    {
        value: "only-out-resp-inline",
        label: "Only OUT-RESP Inline",
        description: "Always show inline ad cards",
    },
    {
        value: "only-out-panel-right",
        label: "Only OUT-PANEL Right",
        description: "Always show ads in right panel",
    },
] as const;

const AD_TARGETING_OPTIONS = [
    {
        value: "turn",
        label: "Per Turn",
        description: "Target ads from latest message",
    },
    {
        value: "contextualized",
        label: "Contextualized",
        description: "Target ads from whole conversation",
    },
] as const;

function normalizeAdTurnMode(mode: string): string {
    if (mode === "only-out-resp") {
        return "only-out-resp-normal";
    }
    return mode;
}

export function UserProfileModal({
    isOpen,
    onClose,
    activeConversationId,
    rightAdPanel,
    isSavingRightAdPanel,
    onToggleRightAdPanel,
    userName,
    userEmail,
}: UserProfileModalProps) {
    const [adTurnMode, setAdTurnMode] = useState("randomized");
    const [adTargetingMode, setAdTargetingMode] = useState("turn");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Fetch current preference on open
    useEffect(() => {
        if (!isOpen) return;
        fetch("/api/user/preferences")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user?.adTurnMode) {
                    setAdTurnMode(normalizeAdTurnMode(data.user.adTurnMode));
                }
                if (data?.user?.adTargetingMode) {
                    setAdTargetingMode(data.user.adTargetingMode);
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

    const handleSaveTargetingMode = async (value: string) => {
        setAdTargetingMode(value);
        setIsSaving(true);
        setSaved(false);

        try {
            const res = await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adTargetingMode: value }),
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="h-[80vh] max-h-[80vh] overflow-y-auto bg-[#1e1e1e] border-zinc-700/50 sm:max-w-lg">
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

                <div>
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

                    <div className="mt-5">
                        <h3 className="text-sm font-semibold text-zinc-200 mb-2">
                            Ad Targeting Mode
                        </h3>

                        <div className="space-y-1.5">
                            {AD_TARGETING_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSaveTargetingMode(option.value)}
                                    disabled={isSaving}
                                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-200 ${adTargetingMode === option.value
                                        ? "bg-violet-500/15 border border-violet-500/40 shadow-sm shadow-violet-500/5"
                                        : "border border-zinc-700/30 hover:bg-zinc-800/50 hover:border-zinc-600/40"
                                        }`}
                                >
                                    <div
                                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${adTargetingMode === option.value
                                            ? "border-violet-400 bg-violet-400"
                                            : "border-zinc-600"
                                            }`}
                                    >
                                        {adTargetingMode === option.value && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p
                                            className={`text-xs font-medium ${adTargetingMode === option.value
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

                    <div className="mt-5">
                        <h3 className="text-sm font-semibold text-zinc-200 mb-2">
                            Right Ad Panel
                        </h3>

                        <button
                            type="button"
                            onClick={onToggleRightAdPanel}
                            disabled={!activeConversationId || isSavingRightAdPanel}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-700/30 px-3 py-2 text-left transition-all duration-200 hover:bg-zinc-800/50 hover:border-zinc-600/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-300">
                                <PanelRight size={13} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-zinc-300">
                                    {rightAdPanel ? "Enabled" : "Disabled"}
                                </p>
                                <p className="text-[11px] text-zinc-500 leading-tight">
                                    {activeConversationId
                                        ? "Move out-response ads between side panel and inline cards"
                                        : "Open a conversation to change this setting"}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
