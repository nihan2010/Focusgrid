export type BlockType = 'study' | 'break' | 'fitness' | 'prayer' | 'custom';
export type TimingMode = 'pomodoro' | 'time-range' | 'manual';

export interface PomodoroConfig {
    workDuration: number;
    breakDuration: number;
    cycles: number;
}

export interface Block {
    id: string;
    type: BlockType;
    mode: TimingMode;
    title: string;
    durationMinutes?: number;
    color?: string;
    completed?: boolean;
    startTime?: string;
    endTime?: string;
    pomodoroConfig?: PomodoroConfig;
    subjects?: string[];
    notes?: string[];
}
export type TreeStage = 'seed' | 'sprout' | 'young' | 'strong' | 'full';

export interface DayRecord {
    date: string; // YYYY-MM-DD format
    blocks: Block[];
    totalPomodoros: number;        // planned/total pomodoros for the day
    completedPomodoros: number;
    skippedSessions: number;
    completionPercentage: number;  // (completedPomodoros / totalPomodoros) * 100
    treeStage: TreeStage;          // derived from completionPercentage
    totalStudyMinutes: number;
    totalBreakMinutes: number;
    distractions: string[];
    streak: number;                // streak at time this record was active/archived
    reflection: {
        worked: string;
        failed: string;
        improvement: string;
    };
}

export interface AlarmConfig {
    enabled: boolean;
    soundType: 'synthetic' | 'custom';
    syntheticTone: 'classic' | 'digital' | 'chime' | 'gong' | 'urgent';
    customSoundData?: string; // base64 string
}

export interface AppSettings {
    hardMode: boolean;
    ramadanMode: boolean;
    volume: number;
    vibrationEnabled: boolean;
    focusTreeEnabled: boolean;
    floatingTimerEnabled: boolean;
    hasSeenOnboarding?: boolean;
    lastBackupDate?: string;
    alarms: {
        workStart: AlarmConfig;
        workEnd: AlarmConfig;
        breakStart: AlarmConfig;
        breakEnd: AlarmConfig;
        blockStart: AlarmConfig;
        blockEnd: AlarmConfig;
        dayComplete: AlarmConfig;
    }
}

export interface Template {
    id: string;
    name: string;
    blocks: Block[];
}
