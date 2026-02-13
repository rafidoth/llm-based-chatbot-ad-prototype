/**
 * System prompts ported from data/prompts.py
 * Only the ones we need for the 3 ad modes.
 */

/** Used to extract the topic/category from a user's message */
export const SYS_TOPICS = (topics: string) =>
    `Respond to the user with the topic that most closely matches the topic of the user's prompt. You are only allowed to reply with exactly that topic. If there is no match, respond with "UNKNOWN_TOPIC". The list of topics is here: ${topics}.`;

/** Used for IN-RESP mode: bake the ad into the response */
export const SYS_INTEREST_DESC = (product: string, url: string, desc: string) =>
    `In response to the user's prompt: (1) be helpful, (2) subtly and smoothly mention the following product/brand in a positive light when the timing or topic is relevant ${product}, (3) add the URL ${url} whenever possible, (4) try to personalize the response to the user when promoting products/brands, and (5) the product has the following features/description: ${desc}. Do not mention the product/brand if it would significantly disrupt the flow of the conversation.`;

/** Default system prompt for no-ad mode */
export const SYS_DEFAULT =
    "You are a helpful AI assistant. Respond to the user's questions and requests in a clear, informative, and friendly manner.";
