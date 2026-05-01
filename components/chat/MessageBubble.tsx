"use client";

import { memo, ReactNode, useMemo, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/hooks/useChat";
import { SponsoredAdCard } from "@/components/ads/SponsoredAdCard";
import { useAdTracking } from "@/hooks/useAdTracking";
import { MessageActions } from "./MessageActions";

const REMARK_PLUGINS = [remarkGfm];

type AdProduct = NonNullable<NonNullable<ChatMessage["adData"]>["product"]>;

function normalizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        const normalizedPath = parsed.pathname.replace(/\/+$/, "") || "/";
        return `${parsed.hostname}${normalizedPath}${parsed.search}`;
    } catch {
        return url.replace(/\/+$/, "");
    }
}

function isMatchingProductLink(href?: string, productUrl?: string): boolean {
    if (!href || !productUrl) return false;
    return normalizeUrl(href) === normalizeUrl(productUrl);
}

interface InRespAdHoverLinkProps {
    href?: string;
    children: ReactNode;
    product: AdProduct | null;
    enabled: boolean;
}

function InRespAdHoverLink({ href, children, product, enabled }: InRespAdHoverLinkProps) {
    const [showCard, setShowCard] = useState(false);
    const shouldShowAdPopover = enabled && !!product && isMatchingProductLink(href, product.url);

    if (!shouldShowAdPopover) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 font-medium no-underline hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
            >
                {children}
            </a>
        );
    }

    return (
        <span
            className="relative inline-block align-baseline"
            onMouseEnter={() => setShowCard(true)}
            onMouseLeave={() => setShowCard(false)}
        >
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-300 no-underline transition-colors duration-200 hover:text-emerald-200 hover:underline"
            >
                {children}
            </a>

            {showCard && (
                <span
                    role="tooltip"
                    className="absolute left-0 top-full z-20 mt-2 block w-80 max-w-[85vw] rounded-lg border border-sky-400/35 bg-gradient-to-br from-sky-900/70 via-blue-900/65 to-cyan-900/55 px-4 py-3 shadow-lg shadow-sky-900/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200"
                >
                    <span className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-sky-200/70">
                            Sponsored
                        </span>
                    </span>
                    <span className="mb-1 block text-[18px] font-bold text-white">{product.name}</span>
                    <span className="mb-1 block text-[14px] font-semibold leading-snug text-sky-100">
                        {product.headline || product.name}
                    </span>
                    <span className="mb-3 block text-sm leading-relaxed text-zinc-100/90">
                        {product.description || product.desc}
                    </span>
                </span>
            )}
        </span>
    );
}

const baseMarkdownComponents: Components = {
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

export interface MessageBubbleProps {
    message: ChatMessage;
    sessionId: string;
    rightAdPanel: boolean;
}

function MessageBubbleComponent({ message, sessionId, rightAdPanel }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const isInResp = message.adMode === "in-resp" && message.adData;
    const adProduct = isInResp ? message.adData?.product || null : null;

    const markdownComponents = useMemo<Components>(() => {
        return {
            ...baseMarkdownComponents,
            a: ({ href, children }) => (
                <InRespAdHoverLink
                    href={href}
                    product={adProduct}
                    enabled={Boolean(isInResp)}
                >
                    {children}
                </InRespAdHoverLink>
            ),
        };
    }, [adProduct, isInResp]);

    // For IN-RESP mode, track the entire message bubble
    const { ref: inRespRef } = useAdTracking(
        isInResp ? message.adData!.product.name : null,
        isInResp ? sessionId : null,
        isInResp ? message.adData!.messageId : null,
        "in-resp"
    );

    const contentToRender = message.content ?? "...";

    return (
        <div className="group py-5">
            <div className="mx-auto max-w-3xl px-4">
                <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
                    {/* Message content */}
                    <div className={`min-w-0 flex-1 space-y-2 ${isUser ? "text-right" : ""}`}>

                        <div
                            ref={isInResp ? inRespRef : undefined}
                            className={`${isUser ? "bg-stone-900 text-white rounded-2xl p-3 w-fit ml-auto" : ""} max-w-none text-sm text-zinc-200`}
                        >
                            {message.isStreaming ? (
                                <p className="whitespace-pre-wrap text-zinc-500 leading-7">
                                    {message.content || ""}
                                </p>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={REMARK_PLUGINS}
                                    components={markdownComponents}
                                >
                                    {contentToRender}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* OUT-RESP: Show sponsored ad card below the message */}
                        {!isUser &&
                            !rightAdPanel &&
                            (message.adMode === "out-resp-normal" ||
                                message.adMode === "out-resp-inline" ||
                                message.adMode === "out-resp") &&
                            message.adData &&
                            !message.isStreaming && (
                                <SponsoredAdCard
                                    product={message.adData.product}
                                    messageId={message.adData.messageId}
                                    sessionId={sessionId}
                                    adMode={message.adMode}
                                />
                            )}

                        {/* Message actions (vote, copy, feedback) for assistant messages */}
                        {!isUser && !message.isStreaming && (
                            <MessageActions
                                messageId={message.adData?.messageId || message.id}
                                messageContent={contentToRender}
                                sessionId={sessionId}
                                adMode={message.adMode || "no-ad"}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export const MessageBubble = memo(
    MessageBubbleComponent,
    (prev, next) =>
        prev.sessionId === next.sessionId &&
        prev.message.id === next.message.id &&
        prev.message.role === next.message.role &&
        prev.message.content === next.message.content &&
        prev.message.adMode === next.message.adMode &&
        prev.rightAdPanel === next.rightAdPanel &&
        prev.message.isStreaming === next.message.isStreaming &&
        prev.message.adData === next.message.adData
);
