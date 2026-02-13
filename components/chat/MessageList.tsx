"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
    messages: ChatMessage[];
    sessionId: string;
}

export function MessageList({ messages, sessionId }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-4">
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/5">
                        <svg
                            className="h-8 w-8 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-200">
                            How can I help you today?
                        </h2>
                        <p className="mt-2 text-sm text-zinc-500">
                            Ask me anything — I&apos;m here to help.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="pb-32 pt-4">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        sessionId={sessionId}
                    />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
