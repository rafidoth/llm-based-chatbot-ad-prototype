"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop: () => void;
    isLoading: boolean;
    className?: string;
}

export function ChatInput({ onSend, onStop, isLoading, className }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [isMultiLine, setIsMultiLine] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea and detect multiline
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 240;
            const clampedHeight = Math.min(scrollHeight, maxHeight);
            textarea.style.height = `${clampedHeight}px`;
            // Switch to rounded corners when content wraps past a single line
            setIsMultiLine(scrollHeight > 44);
        }
    }, [input]);

    // Focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = () => {
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput("");
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        setIsMultiLine(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={className ?? "border-t border-zinc-800/50 bg-[#212121] px-4 pb-4 pt-3"}>
            <div className="mx-auto max-w-3xl">
                <div
                    className={`relative flex items-end gap-2 border bg-natural-900 p-3 shadow-lg transition-all duration-200 focus-within:border-white/30 ${isMultiLine ? "rounded-2xl" : "rounded-full"
                        }`}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Anything"
                        rows={1}
                        className="max-h-[240px] min-h-[24px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-1 text-sm text-zinc-100 outline-none placeholder:text-white/50"
                    />

                    {isLoading ? (
                        <button
                            onClick={onStop}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-600 text-zinc-200 transition-colors hover:bg-zinc-500"
                            aria-label="Stop generating"
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition-all hover:bg-white disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-default"
                            aria-label="Send message"
                        >
                            <ArrowUp size={16} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <p className="mt-2 text-center text-[10px] text-zinc-600">
                    This is a research prototype. Responses may include sponsored content.
                </p>
            </div>
        </div>
    );
}
