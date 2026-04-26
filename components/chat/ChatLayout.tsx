"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { ChatPane } from "./ChatPane";
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
    initialConversations: Conversation[];
}

export function ChatLayout({ user, sessionId, initialConversations }: ChatLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const activeConversationId = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length === 2 && segments[0] === "chat") {
            return decodeURIComponent(segments[1]);
        }

        return null;
    }, [pathname]);

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
        let cancelled = false;

        const loadConversations = async () => {
            try {
                const res = await fetch("/api/conversations");
                if (!res.ok || cancelled) return;

                const data = await res.json();
                if (!cancelled) {
                    setConversations(data.conversations);
                }
            } catch (e) {
                console.error("Failed to fetch conversations:", e);
            }
        };

        void loadConversations();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleNewChat = useCallback(() => {
        router.push("/chat");
    }, [router]);

    const handleSelectConversation = useCallback(
        (id: string) => {
            router.push(`/chat/${id}`);
        },
        [router]
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

                <ChatPane
                    conversationId={activeConversationId}
                    sessionId={sessionId}
                    onConversationListChanged={fetchConversations}
                />
            </div>
        </div>
    );
}
