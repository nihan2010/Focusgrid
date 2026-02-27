import type { Block } from '../types';

export const getMarathonSchedule = (): Block[] => {
    return [
        {
            id: crypto.randomUUID(),
            type: 'study',
            mode: 'pomodoro',
            title: 'Block 1 — Physics (Deep Work)',
            durationMinutes: 360,
            startTime: '05:30',
            endTime: '11:30',
            pomodoroConfig: {
                cycles: 6,
                workDuration: 50,
                breakDuration: 10,
            },
            subjects: ['Laws of Motion', 'Work, Energy', 'Mechanics of Fluids'],
            notes: ['“Draw diagrams first. Units mandatory.”', 'Emphasis: Derivations'],
            completed: false
        },
        {
            id: crypto.randomUUID(),
            type: 'fitness',
            mode: 'time-range',
            title: "Fitness — Active Recovery",
            durationMinutes: 45,
            startTime: '11:30',
            endTime: '12:15',
            notes: ['Tree Impact: Neutral', 'Study Disabled: Yes'],
            completed: false
        },
        {
            id: crypto.randomUUID(),
            type: 'prayer',
            mode: 'time-range',
            title: "Jumu'ah — Spiritual Reset",
            durationMinutes: 90,
            startTime: '12:15',
            endTime: '13:45',
            notes: ['No Pomodoro tracking', 'No productivity scoring impact'],
            completed: false
        },
        {
            id: crypto.randomUUID(),
            type: 'study',
            mode: 'pomodoro',
            title: 'Block 2 — CS & Chemistry',
            durationMinutes: 240,
            startTime: '13:45',
            endTime: '17:45',
            pomodoroConfig: {
                cycles: 4,
                workDuration: 50,
                breakDuration: 10,
            },
            subjects: ['Computer Science: Control Statements', 'Chemistry: Chemical Bonding'],
            notes: ['“Minimum 5 problems per Pomodoro.”'],
            completed: false
        },
        {
            id: crypto.randomUUID(),
            type: 'break',
            mode: 'time-range',
            title: "Iftar — Recharge Window",
            durationMinutes: 165,
            startTime: '17:45',
            endTime: '20:30',
            notes: ['No Pomodoros', 'Tree Impact: Neutral'],
            completed: false
        },
        {
            id: crypto.randomUUID(),
            type: 'study',
            mode: 'pomodoro',
            title: 'Block 3 — Night Rider Session',
            durationMinutes: 240,
            startTime: '20:30',
            endTime: '00:30',
            pomodoroConfig: {
                cycles: 4,
                workDuration: 50,
                breakDuration: 10,
            },
            subjects: ['Organic Chemistry: Hydrocarbons, Ozonolysis', 'English: Summaries'],
            notes: ['“Focus on retention, not speed.”'],
            completed: false
        }
    ];
};
