"use client";

import { useState, useEffect } from "react";
import { Check, Settings } from "lucide-react";
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
}: UserProfileModalProps) {
    const [adTurnMode, setAdTurnMode] = useState("randomized");
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
            })
            .catch(console.error);
    }, [isOpen]);

    const handleSave = async (value: string) => {
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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1e1e1e] border-zinc-700/50 sm:max-w-md">
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
                </div>

                {/* Separator */}
                <div className="border-t border-zinc-700/30" />

                {/* Ad Turn Mode */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-zinc-200">
                            Ad Schedule Mode
                        </h3>
                        {saved && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                <Check size={12} />
                                Saved
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        {AD_TURN_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSave(option.value)}
                                disabled={isSaving}
                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${adTurnMode === option.value
                                        ? "bg-violet-500/15 border border-violet-500/40 shadow-sm shadow-violet-500/5"
                                        : "border border-zinc-700/30 hover:bg-zinc-800/50 hover:border-zinc-600/40"
                                    }`}
                            >
                                {/* Radio indicator */}
                                <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${adTurnMode === option.value
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
                                        className={`text-sm font-medium ${adTurnMode === option.value
                                                ? "text-violet-200"
                                                : "text-zinc-300"
                                            }`}
                                    >
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {option.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
