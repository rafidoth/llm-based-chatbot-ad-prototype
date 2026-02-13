import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";
import { streamText, generateText } from "ai";
import { getAdModeForTurn } from "@/config/ad-schedule";
import {
    getAllCategories,
    findBestMatchingCategory,
    getRandomProductFromCategory,
} from "@/lib/products";
import { SYS_TOPICS, SYS_INTEREST_DESC, SYS_DEFAULT } from "@/lib/prompts";

const MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        if (!sessionData) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        const body = await req.json();
        const { message, conversationId } = body;

        if (!message || !conversationId) {
            return new Response(
                JSON.stringify({ error: "Message and conversationId are required" }),
                { status: 400 }
            );
        }

        // Verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                session: { userId: sessionData.user.id },
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!conversation) {
            return new Response(
                JSON.stringify({ error: "Conversation not found" }),
                { status: 404 }
            );
        }

        // Determine ad mode based on number of assistant messages so far
        const assistantCount = conversation.messages.filter(
            (m: { role: string }) => m.role === "assistant"
        ).length;
        const adMode = getAdModeForTurn(assistantCount);

        // Save user message
        await prisma.message.create({
            data: {
                conversationId,
                role: "user",
                content: message,
                adMode,
            },
        });

        // Build conversation history for the LLM
        const history = conversation.messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));
        history.push({ role: "user", content: message });

        // Update conversation title if first message
        if (conversation.messages.length === 0) {
            const titleText = message.slice(0, 80);
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { title: titleText },
            });
        }

        // ──────────────── NO-AD MODE ────────────────
        if (adMode === "no-ad") {
            const result = streamText({
                model: groq(MODEL),
                system: SYS_DEFAULT,
                messages: history,
            });

            // Create a TransformStream to capture the response for DB storage
            const decoder = new TextDecoder();
            let fullResponse = "";

            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    const text = decoder.decode(chunk, { stream: true });
                    fullResponse += text;
                    controller.enqueue(chunk);
                },
                async flush() {
                    // Save assistant message after streaming is complete
                    await prisma.message.create({
                        data: {
                            conversationId,
                            role: "assistant",
                            content: fullResponse,
                            adMode: "no-ad",
                        },
                    });
                },
            });

            const response = result.toTextStreamResponse();
            const readableStream = response.body;
            if (!readableStream) {
                return new Response("Stream error", { status: 500 });
            }

            const pipedStream = readableStream.pipeThrough(transformStream);

            return new Response(pipedStream, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Ad-Mode": "no-ad",
                },
            });
        }

        // ──────────────── OUT-RESP & IN-RESP: Extract category ────────────────
        const categories = getAllCategories();
        const categorySample = categories.slice(0, 100).join(", ");

        let extractedCategory = "UNKNOWN_TOPIC";
        try {
            const categoryResult = await generateText({
                model: groq(MODEL),
                system: SYS_TOPICS(categorySample),
                messages: [{ role: "user", content: message }],
            });
            extractedCategory = categoryResult.text.trim();
        } catch (e) {
            console.error("Category extraction failed:", e);
        }

        // Find matching category and pick random product
        const matchedCategory = findBestMatchingCategory(extractedCategory);
        const product = matchedCategory
            ? getRandomProductFromCategory(matchedCategory)
            : null;

        // ──────────────── OUT-RESP MODE ────────────────
        if (adMode === "out-resp") {
            const result = streamText({
                model: groq(MODEL),
                system: SYS_DEFAULT,
                messages: history,
            });

            const decoder = new TextDecoder();
            let fullResponse = "";

            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    const text = decoder.decode(chunk, { stream: true });
                    fullResponse += text;
                    controller.enqueue(chunk);
                },
                async flush(controller) {
                    // Save assistant message
                    const savedMessage = await prisma.message.create({
                        data: {
                            conversationId,
                            role: "assistant",
                            content: fullResponse,
                            adMode: "out-resp",
                            adProductName: product?.name || null,
                            adCategory: matchedCategory || null,
                            adProductUrl: product?.url || null,
                            adProductDesc: product?.desc || null,
                        },
                    });

                    // Append ad data as a special frame
                    if (product) {
                        const adData = JSON.stringify({
                            type: "ad_data",
                            messageId: savedMessage.id,
                            adMode: "out-resp",
                            product: {
                                name: product.name,
                                url: product.url,
                                desc: product.desc,
                                category: matchedCategory,
                            },
                        });
                        const encoder = new TextEncoder();
                        controller.enqueue(
                            encoder.encode(`\n[AD_DATA]${adData}[/AD_DATA]\n`)
                        );
                    }
                },
            });

            const response = result.toTextStreamResponse();
            const readableStream = response.body;
            if (!readableStream) {
                return new Response("Stream error", { status: 500 });
            }

            const pipedStream = readableStream.pipeThrough(transformStream);

            return new Response(pipedStream, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Ad-Mode": "out-resp",
                },
            });
        }

        // ──────────────── IN-RESP MODE ────────────────
        if (adMode === "in-resp") {
            const systemPrompt = product
                ? SYS_INTEREST_DESC(product.name, product.url, product.desc)
                : SYS_DEFAULT;

            const result = streamText({
                model: groq(MODEL),
                system: systemPrompt,
                messages: history,
            });

            const decoder = new TextDecoder();
            let fullResponse = "";

            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    const text = decoder.decode(chunk, { stream: true });
                    fullResponse += text;
                    controller.enqueue(chunk);
                },
                async flush(controller) {
                    const savedMessage = await prisma.message.create({
                        data: {
                            conversationId,
                            role: "assistant",
                            content: fullResponse,
                            adMode: "in-resp",
                            adProductName: product?.name || null,
                            adCategory: matchedCategory || null,
                            adProductUrl: product?.url || null,
                            adProductDesc: product?.desc || null,
                        },
                    });

                    // Send ad metadata (for tracking, not displayed as card)
                    if (product) {
                        const adMeta = JSON.stringify({
                            type: "ad_meta",
                            messageId: savedMessage.id,
                            adMode: "in-resp",
                            product: {
                                name: product.name,
                                url: product.url,
                                desc: product.desc,
                                category: matchedCategory,
                            },
                        });
                        const encoder = new TextEncoder();
                        controller.enqueue(
                            encoder.encode(`\n[AD_META]${adMeta}[/AD_META]\n`)
                        );
                    }
                },
            });

            const response = result.toTextStreamResponse();
            const readableStream = response.body;
            if (!readableStream) {
                return new Response("Stream error", { status: 500 });
            }

            const pipedStream = readableStream.pipeThrough(transformStream);

            return new Response(pipedStream, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Ad-Mode": "in-resp",
                },
            });
        }

        return new Response(JSON.stringify({ error: "Unknown ad mode" }), {
            status: 400,
        });
    } catch (error) {
        console.error("Chat error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
        });
    }
}
