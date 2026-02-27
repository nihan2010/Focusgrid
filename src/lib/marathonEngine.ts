import type { Block } from '../types';

export interface MarathonState {
    isActive: boolean;
    blockId: string;
    pomodoroIndex: number; // 0-based
    phase: 'work' | 'break' | 'none';
    timeLeftMs: number;
    progressPercent: number;
    durationMinutes: number; // Total duration of current phase
    sessionName: string;
    nextSessionName: string;
}

const parseTime = (timeStr: string, now: Date): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);
    return date;
};

export const getMarathonState = (blocks: Block[], now: Date): MarathonState | null => {
    for (const block of blocks) {
        if (!block.startTime || !block.endTime) continue;

        const start = parseTime(block.startTime, now);
        const end = parseTime(block.endTime, now);

        if (now >= start && now < end) {
            if (block.mode === 'pomodoro' && block.pomodoroConfig) {
                const config = block.pomodoroConfig;
                const cycleMs = (config.workDuration + config.breakDuration) * 60000;
                const elapsedMs = now.getTime() - start.getTime();

                const cycleIndex = Math.floor(elapsedMs / cycleMs);
                const msInCycle = elapsedMs % cycleMs;

                const workMs = config.workDuration * 60000;
                const isWorkPhase = msInCycle < workMs;

                const phase = isWorkPhase ? 'work' : 'break';
                const timeLeftMs = isWorkPhase ? (workMs - msInCycle) : (cycleMs - msInCycle);
                const durationMinutes = isWorkPhase ? config.workDuration : config.breakDuration;

                const targetPomodoroIndex = Math.min(cycleIndex, config.cycles - 1);

                let sessionName = '';
                let nextSessionName = '';

                if (isWorkPhase) {
                    sessionName = `P${targetPomodoroIndex + 1} — Work`;
                    if (targetPomodoroIndex < config.cycles - 1) {
                        nextSessionName = `Break ${targetPomodoroIndex + 1} (${config.breakDuration}m)`;
                    } else {
                        nextSessionName = 'End of Block';
                    }
                } else {
                    if (targetPomodoroIndex < config.cycles - 1) {
                        sessionName = `Break ${targetPomodoroIndex + 1}`;
                        nextSessionName = `P${targetPomodoroIndex + 2} — Work (${config.workDuration}m)`;
                    } else {
                        // The last 10 minutes (or break duration) after the final pomodoro
                        sessionName = `Transition Buffer`;
                        nextSessionName = 'Next Block';
                    }
                }

                return {
                    isActive: true,
                    blockId: block.id,
                    pomodoroIndex: targetPomodoroIndex,
                    phase,
                    timeLeftMs,
                    progressPercent: 100 - (timeLeftMs / (durationMinutes * 60000)) * 100,
                    durationMinutes,
                    sessionName,
                    nextSessionName
                };
            } else {
                // Non-pomodoro block (Fitness, Prayer, Iftar, Time-Range)
                const elapsedMs = now.getTime() - start.getTime();
                const totalMs = block.durationMinutes ? block.durationMinutes * 60000 : (end.getTime() - start.getTime());
                const timeLeftMs = Math.max(0, totalMs - elapsedMs);
                const durationMinutes = block.durationMinutes ?? Math.floor(totalMs / 60000);

                return {
                    isActive: true,
                    blockId: block.id,
                    pomodoroIndex: 0,
                    phase: 'work', // Treat as a single block of work
                    timeLeftMs,
                    progressPercent: 100 - (timeLeftMs / totalMs) * 100,
                    durationMinutes,
                    sessionName: block.title,
                    nextSessionName: 'Next Block'
                };
            }
        }
    }

    return null; // Not currently in any marathon block
};
