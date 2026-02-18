"use client";

import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/hooks/useChat";
import { SponsoredAdCard } from "@/components/ads/SponsoredAdCard";
import { useAdTracking } from "@/hooks/useAdTracking";

const markdownComponents: Components = {
    // Paragraphs
    p: ({ children }) => (
        <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>
    ),

    // Headings
    h1: ({ children }) => (
        <h1 className="mt-6 mb-3 text-xl font-bold text-zinc-100 leading-tight border-b border-zinc-700/40 pb-2 first:mt-0">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="mt-5 mb-2.5 text-lg font-bold text-zinc-100 leading-snug border-b border-zinc-700/25 pb-1.5 first:mt-0">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="mt-4 mb-2 text-base font-semibold text-zinc-100 leading-snug first:mt-0">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="mt-3 mb-1.5 text-sm font-semibold text-zinc-200 leading-snug first:mt-0">
            {children}
        </h4>
    ),

    // Lists
    ul: ({ children }) => (
        <ul className="my-3 list-disc pl-6 space-y-1.5 first:mt-0 last:mb-0">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="my-3 list-decimal pl-6 space-y-1.5 first:mt-0 last:mb-0">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="leading-7">{children}</li>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-3 border-emerald-400 bg-emerald-500/5 rounded-r-lg pl-4 pr-3 py-2 text-zinc-400 italic first:mt-0 last:mb-0">
            {children}
        </blockquote>
    ),

    // Code
    code: ({ className, children, ...props }) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
            return (
                <code className={`${className} text-xs leading-relaxed`} {...props}>
                    {children}
                </code>
            );
        }
        return (
            <code className="bg-zinc-700/50 text-zinc-200 px-1.5 py-0.5 rounded text-[0.85em] font-mono" {...props}>
                {children}
            </code>
        );
    },
    pre: ({ children }) => (
        <pre className="my-3 rounded-xl border border-zinc-700/50 bg-[#1a1a1a] p-4 overflow-x-auto first:mt-0 last:mb-0">
            {children}
        </pre>
    ),

    // Links
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 font-medium no-underline hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
        >
            {children}
        </a>
    ),

    // Horizontal rule
    hr: () => (
        <hr className="my-6 border-t border-zinc-700/50" />
    ),

    // Tables
    table: ({ children }) => (
        <div className="my-4 overflow-x-auto first:mt-0 last:mb-0">
            <table className="w-full text-sm border-collapse">{children}</table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-zinc-700/15">{children}</thead>
    ),
    th: ({ children }) => (
        <th className="text-left font-semibold text-zinc-200 px-3 py-2 border-b-2 border-zinc-700/60">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-3 py-2 border-b border-zinc-700/30">{children}</td>
    ),

    // Inline
    strong: ({ children }) => (
        <strong className="font-semibold text-zinc-100">{children}</strong>
    ),
    em: ({ children }) => (
        <em className="italic text-zinc-300">{children}</em>
    ),
};

interface MessageBubbleProps {
    message: ChatMessage;
    sessionId: string;
}

export function MessageBubble({ message, sessionId }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const isInResp = message.adMode === "in-resp" && message.adData;

    // For IN-RESP mode, track the entire message bubble
    const { ref: inRespRef } = useAdTracking(
        isInResp ? message.adData!.product.name : null,
        isInResp ? sessionId : null,
        isInResp ? message.adData!.messageId : null,
        "in-resp"
    );

    return (
        <div className={`group py-5`}>
            <div className="mx-auto max-w-3xl px-4">
                <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
                    {/* Message content */}
                    <div className={`min-w-0 flex-1 space-y-2 ${isUser ? "text-right" : ""}`}>

                        <div
                            ref={isInResp ? inRespRef : undefined}
                            className={`${isUser ? "bg-green-800 text-white rounded-2xl p-3 w-fit ml-auto" : ""} max-w-none text-sm text-zinc-200 ${message.isStreaming ? "streaming-cursor" : ""
                                }`}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {message.content || (message.isStreaming ? "" : "...")}
                            </ReactMarkdown>
                        </div>

                        {/* OUT-RESP: Show sponsored ad card below the message */}
                        {!isUser &&
                            message.adMode === "out-resp" &&
                            message.adData &&
                            !message.isStreaming && (
                                <SponsoredAdCard
                                    product={message.adData.product}
                                    messageId={message.adData.messageId}
                                    sessionId={sessionId}
                                    adMode="out-resp"
                                />
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
