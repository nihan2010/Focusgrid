/**
 * Lightweight localStorage-backed session persistence.
 * Written at session start, cleared at session stop.
 * Used to resume timers accurately after page reload or tab sleep.
 */

const SESSION_KEY = 'fg-session';

export interface ActiveSession {
    activeBlockId: string;
    startedAt: number;   // Date.now() at exact moment session started
    durationMs: number;  // total planned duration in milliseconds
    phase: 'work' | 'break';
}

export function saveSession(session: ActiveSession): void {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
        // Storage quota exceeded or unavailable — fail silently
    }
}

export function loadSession(): ActiveSession | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ActiveSession;
        // Basic sanity check
        if (!parsed.activeBlockId || !parsed.startedAt || !parsed.durationMs) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

/** Compute remaining milliseconds for a restored session. Returns <=0 if expired. */
export function getRemainingMs(session: ActiveSession): number {
    const elapsed = Date.now() - session.startedAt;
    return session.durationMs - elapsed;
}
