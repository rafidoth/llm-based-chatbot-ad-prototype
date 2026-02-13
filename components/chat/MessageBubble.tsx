"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot } from "lucide-react";
import { ChatMessage } from "@/hooks/useChat";
import { SponsoredAdCard } from "@/components/ads/SponsoredAdCard";
import { useAdTracking } from "@/hooks/useAdTracking";

interface MessageBubbleProps {
    message: ChatMessage;
    sessionId: string;
}

export function MessageBubble({ message, sessionId }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const isInResp = message.adMode === "in-resp" && message.adData;

    // For IN-RESP mode, track the entire message bubble
    const { ref: inRespRef } = useAdTracking(
        isInResp ? message.adData!.product.name : null,
        isInResp ? sessionId : null,
        isInResp ? message.adData!.messageId : null,
        "in-resp"
    );

    return (
        <div className={`group py-5 ${isUser ? "" : ""}`}>
            <div className="mx-auto max-w-3xl px-4">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isUser
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "bg-gradient-to-br from-emerald-500 to-teal-600"
                            }`}
                    >
                        {isUser ? (
                            <User size={16} className="text-white" />
                        ) : (
                            <Bot size={16} className="text-white" />
                        )}
                    </div>

                    {/* Message content */}
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            {isUser ? "You" : "Assistant"}
                        </div>

                        <div
                            ref={isInResp ? inRespRef : undefined}
                            className={`prose prose-invert max-w-none text-sm leading-relaxed text-zinc-200 ${message.isStreaming ? "streaming-cursor" : ""
                                }`}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content || (message.isStreaming ? "" : "...")}
                            </ReactMarkdown>
                        </div>

                        {/* OUT-RESP: Show sponsored ad card below the message */}
                        {!isUser &&
                            message.adMode === "out-resp" &&
                            message.adData &&
                            !message.isStreaming && (
                                <SponsoredAdCard
                                    product={message.adData.product}
                                    messageId={message.adData.messageId}
                                    sessionId={sessionId}
                                    adMode="out-resp"
                                />
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
