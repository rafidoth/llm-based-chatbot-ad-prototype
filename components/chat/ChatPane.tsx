"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChat } from "@/hooks/useChat";

interface ChatPaneProps {
    conversationId: string | null;
    sessionId: string;
    onConversationListChanged: () => void;
}

export const ChatPane = memo(function ChatPane({
    conversationId,
    sessionId,
    onConversationListChanged,
}: ChatPaneProps) {
    const router = useRouter();
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const {
        messages,
        streamingMessage,
        isLoading,
        sendMessage,
        stopGeneration,
        clearMessages,
        setMessages,
    } = useChat(conversationId);

    const prevIsLoadingRef = useRef(false);

    useEffect(() => {
        if (prevIsLoadingRef.current && !isLoading && conversationId) {
            fetch(`/api/conversations/${conversationId}/messages`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.messages) {
                        setMessages(data.messages);
                    }
                })
                .catch((e) => console.error("Failed to refresh messages:", e));
        }
        prevIsLoadingRef.current = isLoading;
    }, [conversationId, isLoading, setMessages]);

    useEffect(() => {
        let cancelled = false;

        const loadConversation = async () => {
            if (!conversationId) {
                clearMessages();
                if (!cancelled) {
                    setIsLoadingConversation(false);
                }
                return;
            }

            setIsLoadingConversation(true);
            clearMessages();

            try {
                const res = await fetch(`/api/conversations/${conversationId}/messages`);
                const data = res.ok ? await res.json() : null;
                if (!cancelled && data?.messages) {
                    setMessages(data.messages);
                }
            } catch (e) {
                console.error("Failed to load messages:", e);
            } finally {
                if (!cancelled) {
                    setIsLoadingConversation(false);
                }
            }
        };

        void loadConversation();

        return () => {
            cancelled = true;
        };
    }, [conversationId, clearMessages, setMessages]);

    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!conversationId) {
                try {
                    const res = await fetch("/api/conversations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: content.slice(0, 80) }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const newId = data.conversation.id as string;

                        await sendMessage(content, newId);
                        router.push(`/chat/${newId}`);
                        onConversationListChanged();
                        return;
                    }
                } catch (e) {
                    console.error("Failed to create conversation:", e);
                    return;
                }
            }

            await sendMessage(content);
            onConversationListChanged();
        },
        [conversationId, onConversationListChanged, router, sendMessage]
    );

    if (messages.length === 0 && !streamingMessage && !isLoadingConversation) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-4">
                <div className="w-full max-w-3xl">
                    <h2 className="mb-6 text-center text-2xl text-zinc-200">
                        What&apos;s on your mind today?
                    </h2>
                    <ChatInput
                        onSend={handleSendMessage}
                        onStop={stopGeneration}
                        isLoading={isLoading}
                        className="px-4 pb-4 pt-3"
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <MessageList
                messages={messages}
                streamingMessage={streamingMessage}
                sessionId={sessionId}
                isLoadingConversation={isLoadingConversation}
            />
            <ChatInput
                onSend={handleSendMessage}
                onStop={stopGeneration}
                isLoading={isLoading}
            />
        </>
    );
});
