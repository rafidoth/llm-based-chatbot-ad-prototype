"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    adMode?: string;
    adData?: {
        messageId: string;
        adMode: string;
        product: {
            name: string;
            url: string;
            desc: string;
            category: string;
        };
    } | null;
    isStreaming?: boolean;
}

export function useChat(conversationId: string | null) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!conversationId || !content.trim() || isLoading) return;

            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                role: "user",
                content: content.trim(),
            };

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: "",
                isStreaming: true,
            };

            setMessages((prev) => [...prev, userMessage, assistantMessage]);
            setIsLoading(true);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: content.trim(),
                        conversationId,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Chat request failed: ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No reader available");

                const decoder = new TextDecoder();
                let accumulatedText = "";
                let adData: ChatMessage["adData"] = null;
                const adMode = response.headers.get("X-Ad-Mode") || "no-ad";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;

                    // Extract AD_DATA if present
                    const adDataMatch = accumulatedText.match(
                        /\[AD_DATA\]([\s\S]*?)\[\/AD_DATA\]/
                    );
                    if (adDataMatch) {
                        try {
                            adData = JSON.parse(adDataMatch[1]);
                        } catch (e) {
                            console.error("Failed to parse AD_DATA:", e);
                        }
                        accumulatedText = accumulatedText.replace(
                            /\n?\[AD_DATA\][\s\S]*?\[\/AD_DATA\]\n?/,
                            ""
                        );
                    }

                    // Extract AD_META if present
                    const adMetaMatch = accumulatedText.match(
                        /\[AD_META\]([\s\S]*?)\[\/AD_META\]/
                    );
                    if (adMetaMatch) {
                        try {
                            adData = JSON.parse(adMetaMatch[1]);
                        } catch (e) {
                            console.error("Failed to parse AD_META:", e);
                        }
                        accumulatedText = accumulatedText.replace(
                            /\n?\[AD_META\][\s\S]*?\[\/AD_META\]\n?/,
                            ""
                        );
                    }

                    // Clean the Vercel AI SDK data stream protocol artifacts
                    const cleanedText = cleanStreamText(accumulatedText);

                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessage.id
                                ? {
                                    ...msg,
                                    content: cleanedText,
                                    adMode,
                                    adData,
                                    isStreaming: true,
                                }
                                : msg
                        )
                    );
                }

                // Final cleanup
                const finalText = cleanStreamText(accumulatedText);

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessage.id
                            ? {
                                ...msg,
                                content: finalText,
                                adMode,
                                adData,
                                isStreaming: false,
                            }
                            : msg
                    )
                );
            } catch (error) {
                if ((error as Error).name === "AbortError") return;
                console.error("Chat error:", error);

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMessage.id
                            ? {
                                ...msg,
                                content: "Sorry, something went wrong. Please try again.",
                                isStreaming: false,
                            }
                            : msg
                    )
                );
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [conversationId, isLoading]
    );

    const stopGeneration = useCallback(() => {
        abortControllerRef.current?.abort();
        setIsLoading(false);
        setMessages((prev) =>
            prev.map((msg) =>
                msg.isStreaming ? { ...msg, isStreaming: false } : msg
            )
        );
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        stopGeneration,
        clearMessages,
        setMessages,
    };
}

/**
 * Clean the Vercel AI SDK data stream format
 * The SDK sends lines like: 0:"text chunk"\n
 * We extract the actual text from these lines
 */
function cleanStreamText(raw: string): string {
    const lines = raw.split("\n");
    let result = "";

    for (const line of lines) {
        // Match Vercel AI SDK data stream format: 0:"text"
        const match = line.match(/^0:"(.*)"$/);
        if (match) {
            // Unescape the JSON string content
            try {
                result += JSON.parse(`"${match[1]}"`);
            } catch {
                result += match[1];
            }
        }
        // Match data: format as well
        else if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data !== "[DONE]") {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                        result += parsed.choices[0].delta.content;
                    }
                } catch {
                    // Not JSON, might be raw text
                }
            }
        }
        // Other lines (like e:, d:, etc.) are metadata, skip them
        else if (/^[a-f0-9]+:/.test(line)) {
            // Skip metadata lines
        } else if (line.trim()) {
            // Keep any non-protocol text
            result += line;
        }
    }

    return result;
}
