"use client";

import { memo, useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { StreamingBubble } from "./StreamingBubble";

interface MessageListProps {
    messages: ChatMessage[];
    streamingMessage: ChatMessage | null;
    sessionId: string;
    isLoadingConversation?: boolean;
}

function MessageListComponent({
    messages,
    streamingMessage,
    sessionId,
    isLoadingConversation,
}: MessageListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);

    const detectNearBottom = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
        shouldAutoScrollRef.current = distanceFromBottom < 120;
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onScroll = () => detectNearBottom();
        el.addEventListener("scroll", onScroll, { passive: true });
        detectNearBottom();

        return () => el.removeEventListener("scroll", onScroll);
    }, [detectNearBottom]);

    useEffect(() => {
        if (!shouldAutoScrollRef.current) return;
        bottomRef.current?.scrollIntoView({
            behavior: streamingMessage ? "auto" : "smooth",
            block: "end",
        });
    }, [messages, streamingMessage]);

    if (isLoadingConversation) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto">
            <div className="pb-32 pt-4">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        sessionId={sessionId}
                    />
                ))}
                {streamingMessage ? (
                    <StreamingBubble key={streamingMessage.id} content={streamingMessage.content} />
                ) : null}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

export const MessageList = memo(MessageListComponent);
