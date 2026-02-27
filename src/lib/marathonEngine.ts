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
            // We are in this block
            if (block.pomodorosCount && block.workDuration && block.breakDuration) {
                const cycleMs = (block.workDuration + block.breakDuration) * 60000;
                const elapsedMs = now.getTime() - start.getTime();

                const cycleIndex = Math.floor(elapsedMs / cycleMs);
                const msInCycle = elapsedMs % cycleMs;

                const workMs = block.workDuration * 60000;
                const isWorkPhase = msInCycle < workMs;

                const phase = isWorkPhase ? 'work' : 'break';
                const timeLeftMs = isWorkPhase ? (workMs - msInCycle) : (cycleMs - msInCycle);
                const durationMinutes = isWorkPhase ? block.workDuration : block.breakDuration;

                const targetPomodoroIndex = Math.min(cycleIndex, block.pomodorosCount - 1);

                let sessionName = '';
                let nextSessionName = '';

                if (isWorkPhase) {
                    sessionName = `P${targetPomodoroIndex + 1} — Work`;
                    if (targetPomodoroIndex < block.pomodorosCount - 1) {
                        nextSessionName = `Break ${targetPomodoroIndex + 1} (${block.breakDuration}m)`;
                    } else {
                        nextSessionName = 'End of Block';
                    }
                } else {
                    if (targetPomodoroIndex < block.pomodorosCount - 1) {
                        sessionName = `Break ${targetPomodoroIndex + 1}`;
                        nextSessionName = `P${targetPomodoroIndex + 2} — Work (${block.workDuration}m)`;
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
                // Non-pomodoro block (Fitness, Prayer, Iftar)
                const elapsedMs = now.getTime() - start.getTime();
                const totalMs = block.durationMinutes * 60000;
                const timeLeftMs = totalMs - elapsedMs;

                return {
                    isActive: true,
                    blockId: block.id,
                    pomodoroIndex: 0,
                    phase: 'work', // Treat as a single block of work
                    timeLeftMs,
                    progressPercent: 100 - (timeLeftMs / totalMs) * 100,
                    durationMinutes: block.durationMinutes,
                    sessionName: block.title,
                    nextSessionName: 'Next Block'
                };
            }
        }
    }

    return null; // Not currently in any marathon block
};
