"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { StreamingBubble } from "./StreamingBubble";

interface MessageListProps {
    messages: ChatMessage[];
    sessionId: string;
    isLoadingConversation?: boolean;
}

export function MessageList({ messages, sessionId, isLoadingConversation }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
                        />
                    )
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
