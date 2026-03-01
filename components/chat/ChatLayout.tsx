"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { Menu, X } from "lucide-react";

interface Conversation {
    id: string;
    title: string | null;
    createdAt: string;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface ChatLayoutProps {
    user: User;
    sessionId: string;
    conversationId: string | null;
}

export function ChatLayout({ user, sessionId, conversationId }: ChatLayoutProps) {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [adCardVariants, setAdCardVariants] = useState<string[]>([]);

    const {
        messages,
        isLoading,
        sendMessage,
        stopGeneration,
        clearMessages,
        setMessages,
    } = useChat(conversationId);

    // When streaming ends (isLoading: true → false), refetch messages from DB
    const prevIsLoadingRef = useRef(false);
    useEffect(() => {
        if (prevIsLoadingRef.current && !isLoading && conversationId) {
            fetch(`/api/conversations/${conversationId}/messages`)
                .then((res) => res.ok ? res.json() : null)
                .then((data) => {
                    if (data?.messages) {
                        setMessages(data.messages);
                    }
                })
                .catch((e) => console.error("Failed to refresh messages:", e));
        }
        prevIsLoadingRef.current = isLoading;
    }, [isLoading, conversationId, setMessages]);

    // Fetch conversations list for sidebar
    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations);
            }
        } catch (e) {
            console.error("Failed to fetch conversations:", e);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Fetch user's ad card variant preference
    useEffect(() => {
        fetch("/api/user/preferences")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.user?.adCardVariants) {
                    try {
                        const parsed = JSON.parse(data.user.adCardVariants);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setAdCardVariants(parsed);
                        }
                    } catch {
                        // ignore parse errors
                    }
                }
            })
            .catch(console.error);
    }, []);

    // Load messages when conversation ID is provided (from URL)
    useEffect(() => {
        if (!conversationId) return;

        setIsLoadingConversation(true);
        clearMessages();

        fetch(`/api/conversations/${conversationId}/messages`)
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.messages) {
                    setMessages(data.messages);
                }
            })
            .catch((e) => console.error("Failed to load messages:", e))
            .finally(() => setIsLoadingConversation(false));
    }, [conversationId, clearMessages, setMessages]);

    const handleNewChat = useCallback(() => {
        router.push("/chat");
    }, [router]);

    const handleSelectConversation = useCallback(
        (id: string) => {
            router.push(`/chat/${id}`);
        },
        [router]
    );

    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!conversationId) {
                // Create a new conversation, then navigate to it
                try {
                    const res = await fetch("/api/conversations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: content.slice(0, 80) }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const newId = data.conversation.id;

                        // Send the message with the new conversation ID
                        await sendMessage(content, newId);

                        // Navigate to the new conversation page
                        router.push(`/chat/${newId}`);

                        // Refresh sidebar
                        fetchConversations();
                        return;
                    }
                } catch (e) {
                    console.error("Failed to create conversation:", e);
                    return;
                }
            }

            await sendMessage(content);
            fetchConversations();
        },
        [conversationId, sendMessage, fetchConversations, router]
    );

    const handleLogout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (e) {
            console.error("Logout failed:", e);
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-[#212121]">
            {/* Mobile sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed left-3 top-3 z-50 cursor-pointer rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:text-zinc-200 lg:hidden"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 transition-all duration-200 ease-in-out lg:relative ${sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden"
                    }`}
            >
                <Sidebar
                    conversations={conversations}
                    activeConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onLogout={handleLogout}
                    userName={user.name}
                    userEmail={user.email}
                />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main chat area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Header */}
                <header className="flex h-12 items-center justify-between border-b border-zinc-800/50 px-4">
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:block">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                        <h1 className="text-sm font-medium text-zinc-300">
                            r5Chat
                        </h1>
                    </div>
                </header>

                {messages.length === 0 && !isLoadingConversation ? (
                    /* Empty state: center the heading and input together */
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
                ) : (
                    /* Chat state: messages list with input pinned at bottom */
                    <>
                        <MessageList messages={messages} sessionId={sessionId} isLoadingConversation={isLoadingConversation} adCardVariants={adCardVariants} />
                        <ChatInput
                            onSend={handleSendMessage}
                            onStop={stopGeneration}
                            isLoading={isLoading}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
