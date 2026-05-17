"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChat } from "@/hooks/useChat";
import { RightAdPanel } from "@/components/ads/RightAdPanel";

interface ChatPaneProps {
    conversationId: string | null;
    sessionId: string;
    rightAdPanel: boolean;
    onRightAdPanelChange: (value: boolean) => void;
    onRightAdPanelRequestChange: (value: boolean) => void | Promise<void>;
    onConversationListChanged: () => void;
}

export const ChatPane = memo(function ChatPane({
    conversationId,
    sessionId,
    rightAdPanel,
    onRightAdPanelChange,
    onRightAdPanelRequestChange,
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
    const hasRightPanelAds = messages.some(
        (message) =>
            message.role === "assistant" &&
            (message.adMode === "out-resp-normal" ||
                message.adMode === "out-resp-inline" ||
                message.adMode === "out-resp") &&
            message.adData
    ) ||
        Boolean(
            streamingMessage &&
                streamingMessage.role === "assistant" &&
                (streamingMessage.adMode === "out-resp-normal" ||
                    streamingMessage.adMode === "out-resp-inline" ||
                    streamingMessage.adMode === "out-resp") &&
                streamingMessage.adData
        );

    useEffect(() => {
        if (prevIsLoadingRef.current && !isLoading && conversationId) {
            fetch(`/api/conversations/${conversationId}/messages`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.messages) {
                        setMessages(data.messages);
                    }
                    if (typeof data?.conversation?.rightAdPanel === "boolean") {
                        onRightAdPanelChange(data.conversation.rightAdPanel);
                    }
                })
                .catch((e) => console.error("Failed to refresh messages:", e));
        }
        prevIsLoadingRef.current = isLoading;
    }, [conversationId, isLoading, onRightAdPanelChange, setMessages]);

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
                if (!cancelled && typeof data?.conversation?.rightAdPanel === "boolean") {
                    onRightAdPanelChange(data.conversation.rightAdPanel);
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
    }, [conversationId, clearMessages, onRightAdPanelChange, setMessages]);

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
                        if (typeof data.conversation.rightAdPanel === "boolean") {
                            onRightAdPanelChange(data.conversation.rightAdPanel);
                        }

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
        [conversationId, onConversationListChanged, onRightAdPanelChange, router, sendMessage]
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
        <div className="relative flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
                <MessageList
                    messages={messages}
                    streamingMessage={streamingMessage}
                    sessionId={sessionId}
                    rightAdPanel={rightAdPanel}
                    isLoadingConversation={isLoadingConversation}
                />
                <ChatInput
                    onSend={handleSendMessage}
                    onStop={stopGeneration}
                    isLoading={isLoading}
                />
            </div>
            {rightAdPanel && hasRightPanelAds && (
                <button
                    type="button"
                    aria-label="Close ad panel"
                    onClick={() => {
                        void onRightAdPanelRequestChange(false);
                    }}
                    className="fixed inset-0 z-30 bg-black/45 xl:hidden"
                />
            )}
            <RightAdPanel
                messages={streamingMessage ? [...messages, streamingMessage] : messages}
                sessionId={sessionId}
                rightAdPanel={rightAdPanel}
            />
        </div>
    );
});
