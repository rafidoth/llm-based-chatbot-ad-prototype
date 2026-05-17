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

    if (!rightAdPanel || panelAds.length === 0) {
        return null;
    }

    return (
        <aside className="fixed inset-y-12 right-0 z-40 flex w-[88vw] max-w-sm shrink-0 border-l rounded border-zinc-800/60 bg-stone-900 md:bg-[radial-gradient(140%_80%_at_20%_0%,rgba(16,185,129,0.10),transparent_45%),#1b1b1b] xl:relative xl:inset-auto xl:z-auto xl:w-[22rem] ">
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
            <div className="flex h-full w-full flex-col px-3 py-3">
                <div className="flex-1 overflow-y-auto pr-1">
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
                </div>
            </div>
        </aside>
    );
}

export const RightAdPanel = memo(RightAdPanelComponent);
