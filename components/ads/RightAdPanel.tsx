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
        <aside className="hidden xl:flex w-[22rem] shrink-0 border-l border-zinc-800/60 bg-[#1d1d1d]">
            <div className="flex h-full w-full flex-col">
                <div className="border-b border-zinc-800/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                        Sponsored Panel
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3">
                    {panelAds.length === 0 ? (
                        <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-3 text-xs text-zinc-500">
                            No ads yet for this conversation.
                        </div>
                    ) : (
                        <div className="space-y-3">
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
