import { generateText } from "ai";
import { groq } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { SYS_SUMMARIZE } from "@/lib/prompts";

const SUMMARY_MODEL = "openai/gpt-oss-120b";

/**
 * Generates a new rolling summary for a conversation and persists it.
 *
 * new_summary = summarize(previous_summary + latest user message + latest assistant response)
 */
export async function updateConversationSummary(
    conversationId: string,
    previousSummary: string | null,
    userMessage: string,
    assistantResponse: string
): Promise<void> {
    try {
        const contextBlock = previousSummary
            ? `Previous summary:\n${previousSummary}\n\n`
            : "";

        const prompt = `${contextBlock}Latest exchange:\nUser: ${userMessage}\nAssistant: ${assistantResponse}`;

        const { text: newSummary } = await generateText({
            model: groq(SUMMARY_MODEL),
            system: SYS_SUMMARIZE,
            messages: [{ role: "user", content: prompt }],
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { summary: newSummary },
        });
    } catch (error) {
        // Log but don't block the response — summarization is best-effort
        console.error("Failed to update conversation summary:", error);
    }
}
