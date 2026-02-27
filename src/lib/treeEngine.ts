import type { DayRecord, TreeStage } from '../types';

/**
 * Compute completion percentage safely (returns 0 if totalPomodoros is 0).
 */
export function getCompletionPercent(completed: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
}

/**
 * Map a completion percentage to a tree growth stage.
 * 0–20%  → seed
 * 21–40% → sprout
 * 41–60% → young
 * 61–80% → strong
 * 81–100%→ full
 */
export function getTreeStage(percent: number): TreeStage {
    if (percent <= 20) return 'seed';
    if (percent <= 40) return 'sprout';
    if (percent <= 60) return 'young';
    if (percent <= 80) return 'strong';
    return 'full';
}

/**
 * Count how many consecutive archived days (ending at yesterday) had >= 60% completion.
 * Records should be the full archived set (sorted by date, any order – we sort here).
 * todayStr is excluded from the streak calculation.
 */
export function computeStreak(records: DayRecord[], todayStr: string): number {
    // Sort descending so we walk backwards through dates
    const past = records
        .filter(r => r.date < todayStr)
        .sort((a, b) => (a.date > b.date ? -1 : 1));

    let streak = 0;
    for (const record of past) {
        if (record.completionPercentage >= 60) {
            streak++;
        } else {
            break; // streak broken
        }
    }
    return streak;
}

export const TREE_STAGE_LABELS: Record<TreeStage, string> = {
    seed: 'Seed',
    sprout: 'Sprout',
    young: 'Young Tree',
    strong: 'Strong Tree',
    full: 'Full Growth',
};
