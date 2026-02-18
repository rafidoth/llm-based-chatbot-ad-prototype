"use client";

import { useState, useEffect, useCallback } from "react";
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
}

export function ChatLayout({ user, sessionId }: ChatLayoutProps) {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    const {
        messages,
        isLoading,
        sendMessage,
        stopGeneration,
        clearMessages,
        setMessages,
    } = useChat(activeConversationId);

    // Fetch conversations on mount
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

    const handleNewChat = useCallback(() => {
        setActiveConversationId(null);
        clearMessages();
    }, [clearMessages]);

    const handleSelectConversation = useCallback(
        async (id: string) => {
            setActiveConversationId(id);
            clearMessages();
            setIsLoadingConversation(true);

            // Load existing messages for this conversation
            try {
                const res = await fetch(`/api/conversations/${id}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages);
                }
            } catch (e) {
                console.error("Failed to load messages:", e);
            } finally {
                setIsLoadingConversation(false);
            }
        },
        [clearMessages, setMessages]
    );

    const handleSendMessage = useCallback(
        async (content: string) => {
            // If no active conversation, create one first
            if (!activeConversationId) {
                try {
                    const res = await fetch("/api/conversations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: content.slice(0, 80) }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const newId = data.conversation.id;
                        setConversations((prev) => [data.conversation, ...prev]);
                        setActiveConversationId(newId);

                        // Pass the new conversation ID directly to avoid
                        // waiting for React state to propagate
                        await sendMessage(content, newId);

                        // Refresh conversation list to get updated titles
                        fetchConversations();
                        return;
                    }
                } catch (e) {
                    console.error("Failed to create conversation:", e);
                    return;
                }
            }

            await sendMessage(content);

            // Refresh conversation list to get updated titles
            fetchConversations();
        },
        [activeConversationId, sendMessage, fetchConversations]
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
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onLogout={handleLogout}
                    userName={user.name}
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

                {/* Messages */}
                <MessageList messages={messages} sessionId={sessionId} isLoadingConversation={isLoadingConversation} />

                {/* Input */}
                <ChatInput
                    onSend={handleSendMessage}
                    onStop={stopGeneration}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
