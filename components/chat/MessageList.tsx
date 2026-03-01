"use client";

import { useRef, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { StreamingBubble } from "./StreamingBubble";

interface MessageListProps {
    messages: ChatMessage[];
    sessionId: string;
    isLoadingConversation?: boolean;
    adCardVariants?: string[];
}

export function MessageList({ messages, sessionId, isLoadingConversation, adCardVariants }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Compute out-resp index for each message (used for ordered variant cycling)
    // Must be above the early return to respect the Rules of Hooks
    const outRespIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        let idx = 0;
        for (const msg of messages) {
            if (msg.adMode === "out-resp" && msg.adData) {
                map.set(msg.id, idx);
                idx++;
            }
        }
        return map;
    }, [messages]);

    if (isLoadingConversation) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="pb-32 pt-4">
                {messages.map((message) =>
                    message.isStreaming ? (
                        <StreamingBubble key={message.id} content={message.content} />
                    ) : (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            sessionId={sessionId}
                            adCardVariants={adCardVariants}
                            outRespIndex={outRespIndexMap.get(message.id)}
                        />
                    )
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
