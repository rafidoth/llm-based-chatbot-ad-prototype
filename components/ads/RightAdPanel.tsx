"use client";

import { memo } from "react";
import { RightPanelTextAdCard } from "@/components/ads/RightPanelTextAdCard";
import { ChatMessage } from "@/hooks/useChat";

interface RightAdPanelProps {
    messages: ChatMessage[];
    sessionId: string;
    rightAdPanel: boolean;
}

function RightAdPanelComponent({ messages, sessionId, rightAdPanel }: RightAdPanelProps) {
    const panelAds = messages.filter(
        (message) =>
            message.role === "assistant" &&
            (message.adMode === "out-resp-normal" ||
                message.adMode === "out-resp-inline" ||
                message.adMode === "out-resp") &&
            message.adData
    );

    if (!rightAdPanel) {
        return null;
    }

    return (
        <aside className="relative hidden xl:flex w-[22rem] shrink-0 border-l border-zinc-800/60 bg-[radial-gradient(140%_80%_at_20%_0%,rgba(16,185,129,0.10),transparent_45%),#1b1b1b]">
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
            <div className="flex h-full w-full flex-col px-3 py-3">
                <div className="flex-1 overflow-y-auto pr-1">
                    {panelAds.length === 0 ? (
                        <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/45 p-4 text-xs leading-relaxed text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                            Ads will appear here when out-response modes are generated in this conversation.
                        </div>
                    ) : (
                        <div className="space-y-3.5 pb-1">
                            {panelAds.map((message) => (
                                <RightPanelTextAdCard
                                    key={message.id}
                                    product={message.adData!.product}
                                    messageId={message.adData!.messageId}
                                    sessionId={sessionId}
                                    adMode={message.adMode || "out-resp-normal"}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export const RightAdPanel = memo(RightAdPanelComponent);
