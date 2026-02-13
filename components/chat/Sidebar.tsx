"use client";

import { MessageSquarePlus, LogOut, Trash2 } from "lucide-react";

interface Conversation {
    id: string;
    title: string | null;
    createdAt: string;
}

interface SidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onLogout: () => void;
    userName: string;
}

export function Sidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onLogout,
    userName,
}: SidebarProps) {
    return (
        <div className="flex h-full w-[260px] flex-col bg-[#171717] border-r border-zinc-800/50">
            {/* New Chat Button */}
            <div className="p-3">
                <button
                    onClick={onNewChat}
                    className="flex w-full items-center gap-2 rounded-xl border border-zinc-700/50 px-4 py-3 text-sm text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-100"
                >
                    <MessageSquarePlus size={16} />
                    New Chat
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-2">
                <div className="space-y-0.5 py-1">
                    {conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id)}
                            className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeConversationId === conv.id
                                    ? "bg-zinc-800 text-zinc-100"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                                }`}
                        >
                            <span className="truncate flex-1">
                                {conv.title || "New Chat"}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* User info + logout */}
            <div className="border-t border-zinc-800/50 p-3">
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-sm text-zinc-300">{userName}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                        aria-label="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
