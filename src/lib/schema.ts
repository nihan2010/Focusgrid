import { z } from 'zod';
import type { Block } from '../types';

export const PomodoroSchema = z.object({
    workDuration: z.number().min(1),
    breakDuration: z.number().min(0),
    cycles: z.number().min(1)
});

export const BlockSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    type: z.enum(['Study', 'Break', 'Fitness', 'Prayer', 'Review', 'study', 'break', 'fitness', 'prayer', 'review']),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:mm format").optional(),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:mm format").optional(),
    chapters: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
    durationMinutes: z.number().optional(),
    pomodoro: PomodoroSchema.optional(),
    completed: z.boolean().optional(),
});

export const DayRecordConfigSchema = z.object({
    schemaVersion: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
    meta: z.object({
        mode: z.string().optional(),
        hardMode: z.boolean().optional(),
    }).optional(),
    blocks: z.array(BlockSchema)
});

export type PomodoroConfig = z.infer<typeof PomodoroSchema>;
export type BlockConfig = z.infer<typeof BlockSchema>;
export type DayRecordConfig = z.infer<typeof DayRecordConfigSchema>;

/**
 * Pure function to generate a validated Block from a BlockConfig.
 * This completely isolates block logic from UI components.
 */
export function generateBlock(config: BlockConfig): Block {
    // Normalize type string
    const typeStr = (config.type.charAt(0).toUpperCase() + config.type.slice(1).toLowerCase()) as Block['type'];
    const isMarathon = !!config.pomodoro || typeStr === 'Study';

    let finalDuration = config.durationMinutes || 0;

    // Calculate final duration from cycles if pomodoro config is provided
    if (config.pomodoro) {
        const { workDuration, breakDuration, cycles } = config.pomodoro;
        const totalWork = cycles * workDuration;
        const totalBreak = Math.max(0, (cycles - 1) * breakDuration);
        finalDuration = totalWork + totalBreak;
    }

    if (finalDuration <= 0) {
        finalDuration = 50; // Fallback
    }

    const block: Block = {
        id: config.id || crypto.randomUUID(),
        title: config.title,
        type: typeStr,
        durationMinutes: finalDuration,
        completed: config.completed || false,
    };

    if (config.startTime) block.startTime = config.startTime;
    if (config.endTime) block.endTime = config.endTime;
    if (config.chapters && config.chapters.length > 0) block.subjects = config.chapters;
    if (config.notes && config.notes.length > 0) block.notes = config.notes;

    if (isMarathon && config.pomodoro) {
        block.isMarathonBlock = true;
        block.pomodorosCount = config.pomodoro.cycles;
        block.workDuration = config.pomodoro.workDuration;
        block.breakDuration = config.pomodoro.breakDuration;
    } else if (typeStr === 'Study') {
        // Fallback for legacy generic study blocks
        block.isMarathonBlock = true;
        block.pomodorosCount = 1;
        block.workDuration = finalDuration;
        block.breakDuration = 0;
    }

    return block;
}

function timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Parses an entire JSON configuration, runs validation, and returns normalized DayRecord blocks.
 */
export function parseDayRecordConfig(jsonString: string): { success: true, blocks: Block[], meta: DayRecordConfig['meta'], date: string } | { success: false, error: string } {
    try {
        const parsed = JSON.parse(jsonString);
        const result = DayRecordConfigSchema.safeParse(parsed);

        if (!result.success) {
            const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            return { success: false, error: `Validation failed: ${issues}` };
        }

        // Deep semantic validation
        for (const block of result.data.blocks) {
            // Cycle mismatch
            if (block.pomodoro && block.durationMinutes) {
                const calculated = (block.pomodoro.cycles * block.pomodoro.workDuration) + Math.max(0, (block.pomodoro.cycles - 1) * block.pomodoro.breakDuration);
                if (calculated !== block.durationMinutes) {
                    return { success: false, error: `Validation failed: Block "${block.title}" has a cycle mismatch. durationMinutes (${block.durationMinutes}) does not equal cycles * work + breaks (${calculated}).` };
                }
            }

            // Time mismatch
            if (block.startTime && block.endTime) {
                const startMins = timeToMinutes(block.startTime);
                const endMins = timeToMinutes(block.endTime);
                if (endMins <= startMins) {
                    return { success: false, error: `Validation failed: Block "${block.title}" has endTime before startTime.` };
                }
                const duration = endMins - startMins;
                const configDur = block.durationMinutes || (block.pomodoro ? ((block.pomodoro.cycles * block.pomodoro.workDuration) + Math.max(0, (block.pomodoro.cycles - 1) * block.pomodoro.breakDuration)) : 0);
                if (configDur > 0 && duration !== configDur) {
                    return { success: false, error: `Validation failed: Block "${block.title}" time gap (${duration}m) does not match block duration (${configDur}m).` };
                }
            }
        }

        // Time overlap checking
        const blocksWithTimes = result.data.blocks.filter(b => b.startTime && b.endTime);
        for (let i = 0; i < blocksWithTimes.length; i++) {
            for (let j = i + 1; j < blocksWithTimes.length; j++) {
                const a = blocksWithTimes[i];
                const b = blocksWithTimes[j];
                const aStart = timeToMinutes(a.startTime!);
                const aEnd = timeToMinutes(a.endTime!);
                const bStart = timeToMinutes(b.startTime!);
                const bEnd = timeToMinutes(b.endTime!);

                if (aStart < bEnd && aEnd > bStart) {
                    return { success: false, error: `Validation failed: Time overlap between "${a.title}" and "${b.title}".` };
                }
            }
        }

        const validBlocks = result.data.blocks.map(generateBlock);

        return {
            success: true,
            blocks: validBlocks,
            meta: result.data.meta,
            date: result.data.date
        };
    } catch (err: any) {
        return { success: false, error: err.message || "Invalid JSON syntax" };
    }
}
