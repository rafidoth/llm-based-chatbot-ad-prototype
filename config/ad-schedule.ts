/**
 * Ad Mode Schedule Configuration
 *
 * Controls which ad mode is used for each assistant response turn.
 * Supports multiple scheduling strategies selectable per user.
 */

export type AdMode =
    | "no-ad"
    | "out-resp-normal"
    | "out-resp-inline"
    | "out-panel-right"
    | "in-resp";
export type AdTurnMode =
    | "randomized"
    | "ordered"
    | "only-in-resp"
    | "only-out-resp-normal"
    | "only-out-resp-inline"
    | "only-out-panel-right"
    | "only-out-resp";

// Default schedule for ordered mode: cycles through modes
export const AD_MODE_SCHEDULE: AdMode[] = [
    "out-resp-normal",
    "in-resp",
    "out-resp-inline",
    "out-panel-right",
    "no-ad",
    "out-resp-normal",
];

// Override: set a single mode for ALL turns (for testing)
// Set to null to use the user's preference
export const AD_MODE_OVERRIDE: AdMode | null = null;

export function getAdModeForTurn(
    turnIndex: number, adTurnMode: AdTurnMode = "randomized"
): AdMode {
    if (AD_MODE_OVERRIDE) return AD_MODE_OVERRIDE;

    switch (adTurnMode) {
        case "randomized": {
            const randomIndex = Math.floor(
                Math.random() * AD_MODE_SCHEDULE.length);
            return AD_MODE_SCHEDULE[randomIndex];
        }
        case "ordered": {
            return AD_MODE_SCHEDULE[turnIndex % AD_MODE_SCHEDULE.length];
        }
        case "only-in-resp":
            return "in-resp";
        case "only-out-resp-normal":
        case "only-out-resp":
            return "out-resp-normal";
        case "only-out-resp-inline":
            return "out-resp-inline";
        case "only-out-panel-right":
            return "out-panel-right";
        default:
            return AD_MODE_SCHEDULE[turnIndex % AD_MODE_SCHEDULE.length];
    }
}
