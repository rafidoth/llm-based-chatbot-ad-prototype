"use client";

import { useCallback, useRef, useEffect } from "react";

interface AdTrackingEvent {
    sessionId: string;
    messageId: string;
    adMode: string;
    eventType: string;
    durationMs?: number;
    metadata?: Record<string, unknown>;
}

export function useAdTracking(
    adId: string | null,
    sessionId: string | null,
    messageId: string | null,
    adMode: string
) {
    const ref = useRef<HTMLDivElement>(null);
    const eventQueueRef = useRef<AdTrackingEvent[]>([]);
    const hasTrackedFirstInteraction = useRef(false);
    const hasTrackedImpression = useRef(false);
    const mouseEnterTimeRef = useRef<number | null>(null);
    const interactionCountRef = useRef(0);
    const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const enqueueEvent = useCallback(
        (
            eventType: string,
            durationMs?: number,
            metadata?: Record<string, unknown>
        ) => {
            if (!sessionId || !messageId) return;

            eventQueueRef.current.push({
                sessionId,
                messageId,
                adMode,
                eventType,
                durationMs,
                metadata,
            });
        },
        [sessionId, messageId, adMode]
    );

    const flushEvents = useCallback(async () => {
        if (eventQueueRef.current.length === 0) return;

        const events = [...eventQueueRef.current];
        eventQueueRef.current = [];

        try {
            await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ events }),
            });
        } catch (e) {
            // Re-enqueue on failure
            eventQueueRef.current = [...events, ...eventQueueRef.current];
            console.error("Failed to flush ad events:", e);
        }
    }, []);

    // Set up periodic flush + flush on page hide
    useEffect(() => {
        flushTimerRef.current = setInterval(flushEvents, 2000);

        const handleVisibility = () => {
            if (document.visibilityState === "hidden") {
                flushEvents();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            if (flushTimerRef.current) clearInterval(flushTimerRef.current);
            document.removeEventListener("visibilitychange", handleVisibility);
            flushEvents();
        };
    }, [flushEvents]);

    // Intersection Observer for impressions
    useEffect(() => {
        const el = ref.current;
        if (!el || hasTrackedImpression.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        hasTrackedImpression.current = true;
                        enqueueEvent("impression");
                        observer.disconnect();
                    }
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [enqueueEvent]);

    // Mouse / click event handlers
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseEnter = () => {
            mouseEnterTimeRef.current = Date.now();
            enqueueEvent("mouseover_start");

            if (!hasTrackedFirstInteraction.current) {
                hasTrackedFirstInteraction.current = true;
                enqueueEvent("first_interaction");
            }
        };

        const handleMouseLeave = () => {
            const enterTime = mouseEnterTimeRef.current;
            const durationMs = enterTime ? Date.now() - enterTime : 0;
            mouseEnterTimeRef.current = null;
            interactionCountRef.current += 1;

            enqueueEvent("mouseover_end", durationMs, {
                interactionCount: interactionCountRef.current,
            });
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isLink =
                target.tagName === "A" || target.closest("a") !== null;

            enqueueEvent("click", undefined, {
                targetTag: target.tagName,
                isCtaLink: isLink,
            });

            if (!hasTrackedFirstInteraction.current) {
                hasTrackedFirstInteraction.current = true;
                enqueueEvent("first_interaction");
            }
        };

        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
        el.addEventListener("click", handleClick);

        return () => {
            el.removeEventListener("mouseenter", handleMouseEnter);
            el.removeEventListener("mouseleave", handleMouseLeave);
            el.removeEventListener("click", handleClick);
        };
    }, [enqueueEvent]);

    const onDismiss = useCallback(() => {
        enqueueEvent("dismiss");
        flushEvents();
    }, [enqueueEvent, flushEvents]);

    return { ref, onDismiss };
}
