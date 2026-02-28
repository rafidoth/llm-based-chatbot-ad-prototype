# Chatbot-Ad Research Prototype — Project Report

## 1. Project Overview

This project is a **ChatGPT-like conversational AI prototype** built specifically as a research instrument for studying **user perception and behavioral responses to advertisements embedded within AI-generated chat responses**. The prototype is a Next.js web application backed by a PostgreSQL database, a GROQ-hosted LLM (`llama-3.3-70b-versatile`), and the Vercel AI SDK for streaming responses.

The system supports three distinct **ad delivery modes**, each representing a different level of advertisement integration into the conversational flow. Every user interaction with ads is instrumented and persisted for later analysis.

---

## 2. Ad Delivery Modes

The prototype implements **three treatment conditions** designed to capture a spectrum of ad intrusiveness:

### 2.1 No-Ad Mode (`no-ad`)

The control condition. The chatbot responds normally using a neutral system prompt (`"You are a helpful AI assistant…"`). No product information or sponsored content is introduced into the response or the UI.

### 2.2 Non-Biased, Out-of-Response Mode (`out-resp`)

The response itself is **unbiased** — the LLM receives the same neutral system prompt as the no-ad condition. However, after the response completes streaming, a **visually distinct sponsored ad card** is appended below the message. The card shows:

- A "Sponsored" badge (with a pulsing indicator)
- Product name, description, and category
- A "Learn More" CTA link to the product URL
- A dismiss (✕) button

The key characteristic is that **the ad is visually separated from the organic response**, making it clear to the participant that it is a distinct sponsored element.

### 2.3 Biased, In-Response Mode (`in-resp`)

The most integrated condition. The LLM's **system prompt is modified** to instruct the model to subtly weave a product mention into its response:

> *"In response to the user's prompt: (1) be helpful, (2) subtly and smoothly mention the following product/brand in a positive light when the timing or topic is relevant, (3) add the URL whenever possible, (4) try to personalize the response to the user when promoting products/brands…"*

No separate ad card is displayed. The product promotion is **embedded directly within the conversational text**, making it indistinguishable from the organic response at first glance.

---

## 3. Ad Scheduling & Product Selection

### 3.1 Turn-Based Ad Mode Scheduling

Ad modes are assigned on a **per-turn basis** using a configurable schedule array. The current schedule cycles through:

```
["out-resp", "no-ad", "in-resp", "no-ad", "in-resp", "out-resp"]
```

The turn index is determined by counting the number of prior assistant messages in the conversation. The schedule wraps around using modular arithmetic (`turnIndex % schedule.length`), ensuring continuous cycling.

A global override (`AD_MODE_OVERRIDE`) is available for testing, allowing all turns to use a single fixed mode.

> **Research Note:** This deterministic, turn-based scheduling ensures that within a single conversation session, a participant is exposed to a controlled mixture of ad conditions. This within-subject design enables later comparison of engagement metrics across modes for the same user, reducing between-subject variance. For a formal study, consider assigning participants to fixed conditions (between-subjects) or using a Latin Square design to counterbalance order effects.

### 3.2 Context-Aware Product Selection

Rather than selecting ads randomly or via round-robin, the system employs a **topic-matching pipeline**:

1. **Category Extraction:** A separate LLM call (using `generateText`) classifies the user's message against a list of ~100+ product categories from the product catalog (`products.json`, ~1.3 MB).
2. **Fuzzy Category Matching:** The extracted topic is matched against the full category list using exact match → partial/substring match → random fallback.
3. **Random Product Sampling:** A random product is selected from the matched category.

This approach ensures **topical relevance** between the user's conversational context and the advertised product, simulating realistic contextual advertising as found in modern search engines and social media platforms.

---

## 4. UI Interaction Tracking

The system captures fine-grained user interactions with ad elements via the `useAdTracking` hook, which instruments the ad card DOM element (for `out-resp`) or the entire message bubble (for `in-resp`).

### 4.1 Tracked Event Types

| Event Type | Trigger | Additional Data |
|---|---|---|
| `impression` | Ad element is ≥ 50% visible in viewport (via `IntersectionObserver`) | — |
| `first_interaction` | First `mouseenter` or `click` on the ad element | — |
| `mouseover_start` | Mouse cursor enters the ad element | — |
| `mouseover_end` | Mouse cursor leaves the ad element | `durationMs` (hover time), `interactionCount` |
| `click` | Any click within the ad element | `targetTag` (HTML tag clicked), `isCtaLink` (whether an `<a>` tag was clicked) |
| `dismiss` | User clicks the ✕ dismiss button on an out-resp ad card | — |

### 4.2 Event Schema

Each event is persisted in the `AdEvent` database table with the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Unique event identifier |
| `sessionId` | UUID | Links to the authenticated user session |
| `messageId` | UUID | Links to the specific message the ad was attached to |
| `adMode` | String | `"out-resp"` or `"in-resp"` |
| `eventType` | String | One of the six event types above |
| `durationMs` | Integer (nullable) | Duration in milliseconds (for hover events) |
| `metadata` | JSON (nullable) | Flexible key-value data (e.g., `interactionCount`, `targetTag`) |
| `timestamp` | DateTime | Server-set creation timestamp |

### 4.3 Event Batching & Delivery

Events are **batched client-side** in a queue and flushed to the server (`POST /api/events`) in three ways:

1. **Periodic flush:** Every **2 seconds** via `setInterval`
2. **Visibility change:** When the browser tab becomes hidden (`visibilitychange` event), ensuring data is captured even if the user navigates away
3. **Component unmount:** On cleanup, the queue is flushed as a final action
4. **Retry on failure:** If the API call fails, events are re-enqueued for the next flush cycle

---

## 5. Data Schema Overview

The full relational schema is designed around five core entities:

```
User ──< Session ──< Conversation ──< Message ──< AdEvent
                  └──< AdEvent (also linked to Session)
```

### Key Entities

- **User:** Authenticated participant (email, name, hashed password).
- **Session:** Represents a login session (token-based auth with expiry).
- **Conversation:** A chat thread within a session.
- **Message:** Individual messages (both user and assistant). For ad-bearing messages, stores: `adMode`, `adProductName`, `adCategory`, `adProductUrl`, `adProductDesc`.
- **AdEvent:** Granular interaction events, linked to both the specific message and the session.

This schema enables queries such as:
- *"Compare average hover duration on out-resp ads vs. in-resp messages per user"*
- *"What is the click-through rate on contextually-relevant vs. random-fallback ads?"*
- *"Do dismiss rates increase over the course of a session?"*

---

## 6. Research Study Considerations

### 6.1 Study Design Recommendations

| Aspect | Current State | Recommendation |
|---|---|---|
| **Condition Assignment** | Within-subject (mixed per conversation) | Consider between-subjects design or Latin Square for formal study |
| **Participant Awareness** | No debrief mechanism | Add post-session survey & disclosure that ads were experimental |
| **IRB / Ethics** | Not implemented | Mandatory for any human-subjects research; requires informed consent |
| **Session Control** | Open-ended conversations | Define fixed task prompts to ensure comparable data across participants |

### 6.2 Metrics That Can Be Derived from Current Tracking

- **Ad Awareness:** Impression rate, time-to-first-interaction
- **Engagement:** Hover count per ad, total hover duration, CTA click-through rate
- **Ad Avoidance / Resistance:** Dismiss rate, time-to-dismiss, sessions with zero interactions
- **Behavioral Differences Across Modes:** Compare all above metrics between `out-resp` and `in-resp` (note: `in-resp` tracks at the message-bubble level, so hover may include content reading)
- **Contextual Relevance Effect:** Compare engagement on topic-matched ads vs. random-fallback ads (derivable by checking if `adCategory` matches `extractedCategory`)

### 6.3 Additional Tracking To Consider

| Proposed Metric | Purpose | Implementation |
|---|---|---|
| **Scroll depth** | Did the user scroll far enough to see the ad? | Track scroll position relative to ad element |
| **Time on page / message** | How long did the user read the ad-bearing message? | Track message visibility duration |
| **Copy / selection events** | Did the user copy the ad URL or product name? | Listen for `copy` and `selectstart` events on ad elements |
| **Response quality rating** | Does the user perceive ad-bearing responses as less helpful? | Add a thumbs-up/down rating UI per message |
| **Post-session survey** | Capture explicit recall, perceived trustworthiness, and brand attitude | Add a survey component shown at session end |
| **Eye-tracking integration** | Where exactly did the user look? | Requires external hardware; can validate hover-based proxies |

---

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| LLM Provider | GROQ (`llama-3.3-70b-versatile`) |
| AI SDK | Vercel AI SDK (`streamText`, `generateText`) |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | Custom token-based sessions (cookie: `session_token`) |
| Styling | Tailwind CSS |
| Package Manager | pnpm |
