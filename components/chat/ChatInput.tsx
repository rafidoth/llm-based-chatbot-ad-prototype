"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop: () => void;
    isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-zinc-800/50 bg-[#212121] px-4 pb-4 pt-3">
            <div className="mx-auto max-w-3xl">
                <div className="relative flex items-end gap-2 rounded-2xl border border-zinc-700/50 bg-[#2f2f2f] p-2 shadow-lg transition-colors focus-within:border-zinc-600">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message..."
                        rows={1}
                        className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                    />

                    {isLoading ? (
                        <button
                            onClick={onStop}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-600 text-zinc-200 transition-colors hover:bg-zinc-500"
                            aria-label="Stop generating"
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim()}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 transition-all hover:bg-white disabled:bg-zinc-700 disabled:text-zinc-500"
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
