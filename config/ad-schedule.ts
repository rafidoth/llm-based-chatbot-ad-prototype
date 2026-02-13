/**
 * Ad Mode Schedule Configuration
 *
 * Controls which ad mode is used for each assistant response turn.
 * The schedule cycles: turn 0 → index 0, turn 1 → index 1, etc.
 * After the array ends, it wraps around from the beginning.
 */

export type AdMode = "no-ad" | "out-resp" | "in-resp";

// Default schedule: cycles through modes
export const AD_MODE_SCHEDULE: AdMode[] = [
    "no-ad",
    "out-resp",
    "in-resp",
    "no-ad",
    "in-resp",
    "out-resp",
];

// Override: set a single mode for ALL turns (for testing)
// Set to null to use the schedule above
export const AD_MODE_OVERRIDE: AdMode | null = null;

export function getAdModeForTurn(turnIndex: number): AdMode {
    if (AD_MODE_OVERRIDE) return AD_MODE_OVERRIDE;
    return AD_MODE_SCHEDULE[turnIndex % AD_MODE_SCHEDULE.length];
}
