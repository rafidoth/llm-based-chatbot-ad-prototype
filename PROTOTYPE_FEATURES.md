# Chatbot-Ad Prototype — Features & Implementation Overview

---

## 1. Frontend Event Hooks

All user interactions with ad content are captured client-side through the custom **`useAdTracking`** React hook (`hooks/useAdTracking.ts`). The hook instruments a DOM element via a `ref` and emits a structured event stream covering the full engagement lifecycle.

### Tracked Events

| Event | Trigger | Extra Data |
|---|---|---|
| `impression` | Ad element is ≥ 50 % visible in the viewport (`IntersectionObserver`, threshold 0.5) | — |
| `first_interaction` | First `mouseenter` **or** `click` on the ad element (fires once per mount) | — |
| `mouseover_start` | Cursor enters the ad element | — |
| `mouseover_end` | Cursor leaves the ad element | `durationMs` (hover time), `interactionCount` |
| `click` | Any click inside the ad element | `targetTag` (HTML tag), `isCtaLink` (was an `<a>` clicked?) |
| `dismiss` | User clicks the ✕ button on an out-resp ad card | — |

### How It Works

1. **Ref-based instrumentation** — The hook returns a `ref` that is attached to the ad wrapper `<div>`. For `out-resp` mode, the ref wraps the `SponsoredAdCard`; for `in-resp` mode, it wraps the **entire message bubble** (since the ad is embedded within the text).
2. **IntersectionObserver** — A viewport observer watches the ref element at a 50 % visibility threshold. The moment half the ad is visible, an `impression` event is enqueued and the observer disconnects (one-shot).
3. **Mouse & click listeners** — Standard `mouseenter`, `mouseleave`, and `click` event listeners are registered on the ref element. Hover duration is computed via timestamp diff.
4. **First-interaction guard** — A boolean ref (`hasTrackedFirstInteraction`) ensures the `first_interaction` event fires exactly once, regardless of whether it was triggered by a hover or a click.

### Event Batching & Delivery

Events are not sent immediately. They accumulate in a client-side queue and flush to the server (`POST /api/events`) via three channels:

- **Periodic flush** — Every **2 seconds** via `setInterval`.
- **Visibility change** — When the browser tab becomes hidden (`visibilitychange`), ensuring data capture on tab-switch or close.
- **Component unmount** — On React cleanup, the queue is flushed as a final action.
- **Retry on failure** — If the API call fails, events are re-enqueued at the front of the queue for the next cycle.

### Event Schema (persisted in `AdEvent` table)

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Unique event ID |
| `sessionId` | UUID | Authenticated user session |
| `messageId` | UUID | Message the ad was attached to |
| `adMode` | String | `"out-resp"` or `"in-resp"` |
| `eventType` | String | One of the six events above |
| `durationMs` | Int (nullable) | Hover duration in ms |
| `metadata` | JSON (nullable) | Flexible payload (`interactionCount`, `targetTag`, etc.) |
| `timestamp` | DateTime | Server-set creation time |

---

## 2. Ad Display Design Variations

The sponsored ad card rendered in `out-resp` mode is not a single fixed design. The system ships **three visual variants**, all defined in `components/ads/AdCardVariants.tsx`. Each variant receives identical data through the shared `AdCardVariantProps` interface — only styling and layout differ.

### Variant Registry

| # | Name | Style | Label | CTA |
|---|---|---|---|---|
| 1 | **Clean** | Full card layout with headline prominently displayed, padded borders, spacious | `Sponsored · {category}` | "Learn more →" link |
| 2 | **Inline** | Compact, horizontally laid out, minimal padding | `Sponsored · {product}` | "Visit →" link |
| 3 | **Contextual** | Recommendation-style, the **entire card is a clickable `<a>` link**, subtle hover background shift | `Suggested · {category}` | "Learn more" with external-link icon |

### Variant Selection

Selection happens inside `SponsoredAdCard.tsx`:

```tsx
const VariantComponent = useMemo(() => {
    const index = Math.floor(Math.random() * AD_CARD_VARIANTS.length);
    return AD_CARD_VARIANTS[index];
}, []);
```

- A variant is picked **randomly once per mount** (`useMemo` with empty deps).
- All variants share a common **dismiss button** (✕) layered above them by the parent wrapper.
- Adding a new variant only requires defining a new component that accepts `AdCardVariantProps` and pushing it into the `AD_CARD_VARIANTS` array.

### Ad Copy Generation

Each ad card displays an **AI-generated headline and description** rather than raw product data. The `/api/chat` route makes a separate `generateText` LLM call using the `SYS_AD_COPY` prompt, which produces a catchy, context-aware headline (3–8 words) and a short benefit-focused description (≤ 120 chars) based on the user's message and the selected product.

---

## 3. Ad Delivery Scheduling

The prototype implements a configurable **turn-based scheduling system** to control which ad mode is used for each assistant response. The logic lives in `config/ad-schedule.ts`.

### Scheduling Strategies

The system supports **four scheduling strategies**, selectable per user via the `adTurnMode` preference (stored in the `User` table and configurable through `UserProfileModal` → `PATCH /api/user/preferences`):

| Strategy | Behavior |
|---|---|
| **`randomized`** (default) | Randomly picks a mode from the schedule array each turn |
| **`ordered`** | Cycles through the schedule array deterministically using `turnIndex % schedule.length` |
| **`only-in-resp`** | Forces every turn to use the `in-resp` (biased, embedded) mode |
| **`only-out-resp`** | Forces every turn to use the `out-resp` (unbiased, card) mode |

### Default Schedule Array

```ts
const AD_MODE_SCHEDULE: AdMode[] = [
    "out-resp",
    "no-ad",
    "in-resp",
    "out-resp",
    "out-resp",
];
```

### Turn Index Calculation

The turn index is computed server-side in the chat API route by counting the number of **existing assistant messages** in the conversation:

```ts
const assistantCount = conversation.messages.filter(m => m.role === "assistant").length;
const adMode = getAdModeForTurn(assistantCount, adTurnMode);
```

### Global Override

A constant `AD_MODE_OVERRIDE` can be set to any single mode (`"no-ad"`, `"out-resp"`, or `"in-resp"`) to force all turns to use that mode, regardless of user preference or schedule. This is intended for testing and debugging.

---

## 4. Ad Personalization — RAG-Based Approach (Planned)

The current prototype uses an **LLM-driven category classifier** to match the user's message to a product category from the catalog. While functional, this approach is limited to surface-level topic matching and does not consider the user's broader interests, conversation history, or behavioral patterns.

### Current Pipeline (Baseline)

```
User Message → LLM classifies category → Fuzzy-match against catalog → Random product from category
```

### Proposed RAG Enhancement

A **Retrieval-Augmented Generation (RAG)** pipeline can be implemented to significantly improve ad personalization and contextual relevance. The key idea is to replace the simple classify-and-match step with a semantic retrieval system that considers richer context signals.

#### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     RAG Ad Personalization                        │
│                                                                  │
│  ┌─────────────┐     ┌──────────────────┐     ┌──────────────┐  │
│  │ User Context │────▶│ Embedding Model  │────▶│ Vector Store │  │
│  │  - Message   │     │ (e.g. OpenAI Ada │     │ (Pinecone /  │  │
│  │  - History   │     │  or GROQ embed)  │     │  pgvector)   │  │
│  │  - Profile   │     └──────────────────┘     └──────┬───────┘  │
│  └─────────────┘                                      │          │
│                                                       ▼          │
│                                              ┌──────────────┐    │
│  ┌─────────────┐                             │  Semantic     │   │
│  │ Product     │──── pre-indexed ────────────▶│  Search      │   │
│  │ Catalog     │   embeddings                │  (top-k)     │   │
│  └─────────────┘                             └──────┬───────┘   │
│                                                      │           │
│                                                      ▼           │
│                                              ┌──────────────┐    │
│                                              │ Re-ranking + │    │
│                                              │ LLM Selection│    │
│                                              └──────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

#### How It Would Work

1. **Product Embedding Index** — Pre-compute vector embeddings for every product in `products.json` (name + description + category concatenated). Store in a vector database (e.g., pgvector as a PostgreSQL extension, or a managed service like Pinecone/Weaviate).

2. **Context Window Construction** — At query time, build a richer context signal beyond just the current message:
   - Current user message
   - Last N messages from conversation history (conversational context)
   - User's historical ad interaction patterns (clicked categories, dismissed products)
   - User profile metadata if available

3. **Semantic Retrieval** — Embed the context window and perform a nearest-neighbor search against the product index. Retrieve the top-k (e.g., 5–10) most semantically similar products.

4. **Re-ranking / LLM Selection** — Pass the retrieved candidates to the LLM with a re-ranking prompt that considers:
   - Relevance to the current conversation topic
   - Diversity (avoid showing the same product/category repeatedly)
   - Recency of user interactions with similar products
   - Negative signals (previously dismissed products)

5. **Personalized Ad Copy** — The existing `SYS_AD_COPY` prompt can be extended to incorporate retrieved context, generating ad headlines that reference specific details from the user's conversation rather than generic product descriptions.

#### Benefits Over Current Approach

| Aspect | Current (Classify + Match) | RAG-Based |
|---|---|---|
| **Matching quality** | Keyword/topic-level | Semantic similarity |
| **Context awareness** | Single message only | Conversation history + user profile |
| **Product diversity** | Random from matched category | Top-k retrieval with diversity constraints |
| **Personalization** | None | Based on interaction history |
| **Negative feedback** | Not considered | Can exclude dismissed products |
| **Scalability** | Linear scan of categories | Vector index with sub-linear search |

#### Implementation Notes

- **No changes to the frontend are required** — the RAG pipeline replaces only the server-side product selection logic in `/api/chat/route.ts`.
- **pgvector** is the natural choice since the project already uses PostgreSQL via Prisma. Adding a vector column to a `ProductEmbedding` table avoids introducing a new infrastructure dependency.
- The embedding model can be swapped independently of the chat LLM (e.g., use OpenAI `text-embedding-3-small` for embeddings while keeping GROQ/Llama for generation).
- For a research study, the RAG pipeline can be A/B tested against the current baseline to measure whether semantic ad matching improves engagement metrics.
