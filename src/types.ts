export interface Block {
    id: string;
    type: 'Study' | 'Break' | 'Fitness' | 'Prayer' | 'Review';
    title: string;
    durationMinutes: number;
    color?: string;
    completed?: boolean;
    // Marathon properties
    startTime?: string; // HH:mm format
    endTime?: string;   // HH:mm format
    pomodorosCount?: number;
    workDuration?: number; // default 50
    breakDuration?: number; // default 10
    subjects?: string[];
    notes?: string[];
    isMarathonBlock?: boolean;
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
