"use client";

import { useState, useRef, useEffect } from "react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    messageId: string;
}

export function FeedbackModal({ isOpen, onClose, messageId }: FeedbackModalProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setContent("");
            setSubmitted(false);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, content: content.trim() }),
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                console.error("Failed to submit feedback");
            }
        } catch (e) {
            console.error("Feedback submission error:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-zinc-900/95 border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-100">Send Feedback</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {submitted ? (
                    /* Success state */
                    <div className="px-5 pb-6 pt-2">
                        <div className="flex flex-col items-center gap-3 py-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </div>
                            <p className="text-sm text-zinc-300 font-medium">Thank you for your feedback!</p>
                        </div>
                    </div>
                ) : (
                    /* Form state */
                    <div className="px-5 pb-5">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tell us what you think about this response..."
                            rows={4}
                            className="w-full resize-none rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-colors"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-zinc-600">Press Enter to submit, Shift+Enter for new line</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!content.trim() || isSubmitting}
                                    className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                                >
                                    {isSubmitting ? "Sending..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
