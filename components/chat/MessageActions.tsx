"use client";

import { useState, useCallback } from "react";
import { FeedbackModal } from "./FeedbackModal";

interface MessageActionsProps {
    messageId: string;
    messageContent: string;
    sessionId: string;
    adMode: string;
}

export function MessageActions({ messageId, messageContent, sessionId, adMode }: MessageActionsProps) {
    const [voteState, setVoteState] = useState<"none" | "up" | "down">("none");
    const [copied, setCopied] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const sendVoteEvent = useCallback(
        async (eventType: "vote_up" | "vote_down") => {
            try {
                await fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        events: [
                            {
                                sessionId,
                                messageId,
                                adMode: adMode || "no-ad",
                                eventType,
                            },
                        ],
                    }),
                });
            } catch (e) {
                console.error("Failed to send vote event:", e);
            }
        },
        [sessionId, messageId, adMode]
    );

    const handleUpvote = () => {
        const newState = voteState === "up" ? "none" : "up";
        setVoteState(newState);
        if (newState === "up") {
            sendVoteEvent("vote_up");
        }
    };

    const handleDownvote = () => {
        const newState = voteState === "down" ? "none" : "down";
        setVoteState(newState);
        if (newState === "down") {
            sendVoteEvent("vote_down");
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(messageContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Copy failed:", e);
        }
    };

    return (
        <>
            <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Upvote */}
                <button
                    onClick={handleUpvote}
                    title="Good response"
                    className={`flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150 cursor-pointer ${voteState === "up"
                            ? "text-emerald-400 bg-emerald-500/15"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        }`}
                >
                    <svg className="h-3.5 w-3.5" fill={voteState === "up" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                    </svg>
                </button>

                {/* Downvote */}
                <button
                    onClick={handleDownvote}
                    title="Bad response"
                    className={`flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150 cursor-pointer ${voteState === "down"
                            ? "text-red-400 bg-red-500/15"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        }`}
                >
                    <svg className="h-3.5 w-3.5" fill={voteState === "down" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 2.25 12c0-2.848.992-5.464 2.649-7.521C5.287 3.997 5.886 3.75 6.504 3.75h4.369a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.5a2.25 2.25 0 0 0 2.25 2.25.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.861-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
                    </svg>
                </button>

                {/* Divider */}
                <div className="w-px h-4 bg-zinc-700/50 mx-1" />

                {/* Copy */}
                <button
                    onClick={handleCopy}
                    title={copied ? "Copied!" : "Copy message"}
                    className={`flex items-center justify-center h-7 rounded-lg px-1.5 transition-all duration-150 cursor-pointer ${copied
                            ? "text-emerald-400 bg-emerald-500/15"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        }`}
                >
                    {copied ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                    )}
                    {copied && <span className="text-xs ml-1 font-medium">Copied</span>}
                </button>

                {/* Divider */}
                <div className="w-px h-4 bg-zinc-700/50 mx-1" />

                {/* Feedback */}
                <button
                    onClick={() => setFeedbackOpen(true)}
                    title="Send feedback"
                    className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all duration-150 cursor-pointer"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                </button>
            </div>

            <FeedbackModal
                isOpen={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                messageId={messageId}
            />
        </>
    );
}
