import { create } from 'zustand';
import { format, addDays } from 'date-fns';
import type { AppSettings, DayRecord, Block, TreeStage, Template } from '../types';
import * as db from '../lib/db';
import { getMarathonState } from '../lib/marathonEngine';
import type { MarathonState } from '../lib/marathonEngine';
import { getCompletionPercent, getTreeStage, computeStreak } from '../lib/treeEngine';
import { saveSession, loadSession, clearSession, getRemainingMs } from '../lib/sessionStore';

const createDefaultAlarm = (tone: 'classic' | 'digital' | 'chime' | 'gong' | 'urgent'): any => ({
    enabled: true,
    soundType: 'synthetic',
    syntheticTone: tone,
});

const defaultSettings: AppSettings = {
    hardMode: false,
    ramadanMode: false,
    volume: 0.8,
    vibrationEnabled: true,
    focusTreeEnabled: true,
    floatingTimerEnabled: false,
    alarms: {
        workStart: createDefaultAlarm('chime'),
        workEnd: createDefaultAlarm('urgent'),
        breakStart: createDefaultAlarm('gong'),
        breakEnd: createDefaultAlarm('digital'),
        blockStart: createDefaultAlarm('classic'),
        blockEnd: createDefaultAlarm('classic'),
        dayComplete: createDefaultAlarm('classic')
    }
};

const createEmptyDay = (dateStr: string, streak = 0): DayRecord => ({
    date: dateStr,
    blocks: [],
    totalPomodoros: 0,
    completedPomodoros: 0,
    skippedSessions: 0,
    completionPercentage: 0,
    treeStage: 'seed' as TreeStage,
    totalStudyMinutes: 0,
    totalBreakMinutes: 0,
    distractions: [],
    streak,
    reflection: { worked: '', failed: '', improvement: '' },
});

/** Count total planned pomodoros across all marathon blocks in a day's block list. */
function countTotalPomodoros(blocks: Block[]): number {
    return blocks.reduce((sum, b) => sum + (b.isMarathonBlock ? (b.pomodorosCount ?? 1) : 0), 0);
}

interface FocusGridState {
    settings: AppSettings;
    today: DayRecord | null;
    tomorrow: DayRecord | null;
    archivedRecords: DayRecord[];
    templates: Template[];
    streak: number;
    activeBlockId: string | null;
    timerRunning: boolean;
    isInitialized: boolean;
    isMiniPlayer: boolean;
    activeAlarmInfo: { title: string; subtitle: string; eventType: keyof AppSettings['alarms'] } | null;
    marathonState: MarathonState | null;
    _transitionLockDate: string | null;
    /** Set when a session is restored from localStorage after a page reload. Used to seed the timer. */
    restoredTimeMs: number | null;
    /** Shown in a temporary banner after a session restore. */
    sessionRestoreMessage: string | null;

    triggerAlarm: (info: { title: string; subtitle: string; eventType: keyof AppSettings['alarms'] }) => void;
    dismissAlarm: () => void;
    minimizeSession: () => void;
    expandSession: () => void;
    clearRestoredTime: () => void;
    dismissRestoreMessage: () => void;

    initStore: () => Promise<void>;
    loadArchive: () => Promise<void>;
    loadTemplates: () => Promise<void>;
    recalculateDailyProgress: () => void;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    updateToday: (updates: Partial<DayRecord>) => Promise<void>;
    updateTomorrow: (updates: Partial<DayRecord>) => Promise<void>;
    addBlock: (target: 'today' | 'tomorrow', block: Block) => Promise<void>;
    updateBlock: (target: 'today' | 'tomorrow', blockId: string, updates: Partial<Block>) => Promise<void>;
    removeBlock: (target: 'today' | 'tomorrow', blockId: string) => Promise<void>;
    saveAsTemplate: (name: string, blocks: Block[]) => Promise<void>;
    removeTemplate: (id: string) => Promise<void>;
    startSession: (blockId: string) => void;
    stopSession: () => void;
    globalTick: (now: Date) => void;
    checkMidnightTransition: () => Promise<void>;
}

export const useStore = create<FocusGridState>((set, get) => ({
    settings: defaultSettings,
    today: null,
    tomorrow: null,
    archivedRecords: [],
    templates: [],
    streak: 0,
    activeBlockId: null,
    timerRunning: false,
    isInitialized: false,
    isMiniPlayer: false,
    activeAlarmInfo: null,
    marathonState: null,
    _transitionLockDate: null as string | null,
    restoredTimeMs: null,
    sessionRestoreMessage: null,

    triggerAlarm: (info) => set({ activeAlarmInfo: info }),
    dismissAlarm: () => set({ activeAlarmInfo: null }),
    minimizeSession: () => set({ isMiniPlayer: true }),
    expandSession: () => set({ isMiniPlayer: false }),
    clearRestoredTime: () => set({ restoredTimeMs: null }),
    dismissRestoreMessage: () => set({ sessionRestoreMessage: null }),

    loadArchive: async () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        const archived = await db.getArchivedDayRecords(todayStr, tomorrowStr);
        const streak = computeStreak(archived, todayStr);
        set({ archivedRecords: archived, streak });
    },

    loadTemplates: async () => {
        const templates = await db.getAllTemplates();
        set({ templates });
    },


    recalculateDailyProgress: () => {
        const { today } = get();
        if (!today) return;
        const pct = getCompletionPercent(today.completedPomodoros, today.totalPomodoros);
        const stage = getTreeStage(pct);
        // Only update if something changed (avoids spurious re-renders)
        if (pct !== today.completionPercentage || stage !== today.treeStage) {
            const updated = { ...today, completionPercentage: pct, treeStage: stage };
            set({ today: updated });
            // Persist quietly
            db.saveDayRecord(updated).catch(console.error);
        }
    },

    initStore: async () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

        // Load settings
        const savedSettings = await db.getSettings();
        const mergedSettings = savedSettings
            ? { ...defaultSettings, ...savedSettings, alarms: { ...defaultSettings.alarms, ...(savedSettings.alarms || {}) } }
            : { ...defaultSettings };

        if (!savedSettings) {
            await db.saveSettings(defaultSettings);
        }

        // --- Load archived records and compute streak FIRST ---
        const archived = await db.getArchivedDayRecords(todayStr, tomorrowStr);
        const streak = computeStreak(archived, todayStr);

        // --- Load or create Today ---
        let todayRecord = await db.getDayRecord(todayStr);

        if (!todayRecord) {
            todayRecord = createEmptyDay(todayStr, streak);
            await db.saveDayRecord(todayRecord);
        }

        // --- Load or create Tomorrow ---
        let tomorrowRecord = await db.getDayRecord(tomorrowStr);
        if (!tomorrowRecord) {
            tomorrowRecord = createEmptyDay(tomorrowStr, streak);
            await db.saveDayRecord(tomorrowRecord);
        }

        set({ settings: mergedSettings });

        set({
            today: todayRecord,
            tomorrow: tomorrowRecord,
            archivedRecords: archived,
            streak,
            isInitialized: true,
            _transitionLockDate: todayStr,
        });

        // Also fetch templates
        get().loadTemplates();

        // --- Check for a persisted active session and restore it ---
        const savedSession = loadSession();
        if (savedSession) {
            const remaining = getRemainingMs(savedSession);
            const todayLoaded = get().today;
            const blockExists = todayLoaded?.blocks.some(b => b.id === savedSession.activeBlockId);

            if (remaining > 0 && blockExists) {
                const mins = Math.ceil(remaining / 60000);
                set({
                    activeBlockId: savedSession.activeBlockId,
                    timerRunning: true,
                    restoredTimeMs: remaining,
                    sessionRestoreMessage: `Session Restored — ${mins}m remaining`,
                });
            } else {
                // Session expired while page was closed — clean up
                clearSession();
            }
        }
    },

    updateSettings: async (newSettings) => {
        const settings = { ...get().settings, ...newSettings };
        set({ settings });
        await db.saveSettings(settings);
    },

    updateToday: async (updates) => {
        const { today } = get();
        if (!today) return;
        const merged = { ...today, ...updates };

        // Auto-recompute tree state whenever pomodoro counts change
        if ('completedPomodoros' in updates || 'totalPomodoros' in updates) {
            merged.completionPercentage = getCompletionPercent(merged.completedPomodoros, merged.totalPomodoros);
            merged.treeStage = getTreeStage(merged.completionPercentage);
        }

        set({ today: merged });
        await db.saveDayRecord(merged);
    },

    updateTomorrow: async (updates) => {
        const { tomorrow } = get();
        if (!tomorrow) return;
        const updated = { ...tomorrow, ...updates };
        set({ tomorrow: updated });
        await db.saveDayRecord(updated);
    },

    addBlock: async (target, block) => {
        const record = get()[target];
        if (!record) return;
        const updatedBlocks = [...record.blocks, block];
        const totalPomodoros = countTotalPomodoros(updatedBlocks);
        const updated = { ...record, blocks: updatedBlocks, totalPomodoros };
        if (target === 'today') await get().updateToday(updated);
        else await get().updateTomorrow(updated);
    },

    updateBlock: async (target, blockId, updates) => {
        const record = get()[target];
        if (!record) return;
        const updatedBlocks = record.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b);
        const totalPomodoros = countTotalPomodoros(updatedBlocks);
        const updated = { ...record, blocks: updatedBlocks, totalPomodoros };
        if (target === 'today') await get().updateToday(updated);
        else await get().updateTomorrow(updated);
    },

    removeBlock: async (target, blockId) => {
        const record = get()[target];
        if (!record) return;
        const updatedBlocks = record.blocks.filter(b => b.id !== blockId);
        const totalPomodoros = countTotalPomodoros(updatedBlocks);
        const updated = { ...record, blocks: updatedBlocks, totalPomodoros };
        if (target === 'today') await get().updateToday(updated);
        else await get().updateTomorrow(updated);
    },

    saveAsTemplate: async (name, blocks) => {
        const newTemplate: Template = {
            id: crypto.randomUUID(),
            name,
            blocks: blocks.map(b => ({ ...b, id: crypto.randomUUID(), completed: false }))
        };
        await db.saveTemplate(newTemplate);
        await get().loadTemplates();
    },

    removeTemplate: async (id) => {
        await db.deleteTemplate(id);
        await get().loadTemplates();
    },


    startSession: (blockId) => {
        const { settings, today } = get();
        const block = today?.blocks.find(b => b.id === blockId);
        if (block) {
            saveSession({
                activeBlockId: blockId,
                startedAt: Date.now(),
                durationMs: block.durationMinutes * 60 * 1000,
                phase: block.type === 'Break' ? 'break' : 'work',
            });
        }
        set({ activeBlockId: blockId, timerRunning: true, isMiniPlayer: settings.floatingTimerEnabled });
    },

    stopSession: () => {
        clearSession();
        set({ activeBlockId: null, timerRunning: false, isMiniPlayer: false });
    },

    checkMidnightTransition: async () => {
        const { today, _transitionLockDate, initStore } = get();
        if (!today) return;

        const currentRealDateStr = format(new Date(), 'yyyy-MM-dd');

        if (currentRealDateStr !== today.date && currentRealDateStr !== _transitionLockDate) {
            console.log('Midnight Transition Detected — archiving today and advancing...');
            set({ _transitionLockDate: currentRealDateStr });

            try {
                // Stamp final completion figures on the outgoing Today before archiving it
                const finalPct = getCompletionPercent(today.completedPomodoros, today.totalPomodoros);
                const finalStage = getTreeStage(finalPct);
                const finalRecord: DayRecord = {
                    ...today,
                    completionPercentage: finalPct,
                    treeStage: finalStage,
                };
                await db.saveDayRecord(finalRecord);

                // Let initStore promote Tomorrow → Today and generate new Tomorrow
                await initStore();
            } catch (err) {
                console.error('Failed executing midnight transition:', err);
            }
        }
    },

    globalTick: (now: Date) => {
        const { today, marathonState: prevState, triggerAlarm, timerRunning, settings } = get();
        if (!today) return;

        const newState = getMarathonState(today.blocks, now);

        if (newState && prevState) {
            if (newState.blockId !== prevState.blockId) {
                triggerAlarm({ title: `Block Started: ${newState.sessionName}`, subtitle: `Starting ${newState.sessionName}`, eventType: 'blockStart' });
            } else if (newState.phase !== prevState.phase) {
                if (newState.phase === 'break') {
                    const { updateToday, today: t } = get();
                    if (t) {
                        // increment completedPomodoros — updateToday auto-recomputes % and stage
                        updateToday({ completedPomodoros: t.completedPomodoros + 1 });
                    }
                    triggerAlarm({
                        title: `Pomodoro ${prevState.pomodoroIndex + 1} Complete`,
                        subtitle: 'Break Starts',
                        eventType: 'workEnd'
                    });
                } else if (newState.phase === 'work') {
                    triggerAlarm({
                        title: `Break Over`,
                        subtitle: `Start Pomodoro ${newState.pomodoroIndex + 1}`,
                        eventType: 'breakEnd'
                    });
                }
            }
        } else if (newState && !prevState) {
            triggerAlarm({ title: 'Marathon Block Started', subtitle: `Focus. ${newState.sessionName}`, eventType: 'blockStart' });
        }

        const forceStart = newState && (!prevState || prevState.blockId !== newState.blockId) && settings.hardMode;
        const newActiveBlockId = forceStart ? newState.blockId : get().activeBlockId;
        const newTimerRunning = forceStart ? true : timerRunning;

        set({
            marathonState: newState,
            activeBlockId: newActiveBlockId,
            timerRunning: newTimerRunning,
        });
    },
}));
