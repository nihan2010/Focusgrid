import type { Block } from '../types';

export const getMarathonSchedule = (): Block[] => {
    return [
        {
            id: crypto.randomUUID(),
            type: 'Study',
            title: 'Block 1 — Physics (Deep Work)',
            durationMinutes: 360, // 6 hours
            startTime: '05:30',
            endTime: '11:30',
            pomodorosCount: 6,
            workDuration: 50,
            breakDuration: 10,
            subjects: ['Laws of Motion', 'Work, Energy', 'Mechanics of Fluids'],
            notes: ['“Draw diagrams first. Units mandatory.”', 'Emphasis: Derivations'],
            isMarathonBlock: true
        },
        {
            id: crypto.randomUUID(),
            type: 'Fitness',
            title: "Fitness — Active Recovery",
            durationMinutes: 45, // 11:30 - 12:15 = 45 mins
            startTime: '11:30',
            endTime: '12:15',
            notes: ['Tree Impact: Neutral', 'Study Disabled: Yes'],
            isMarathonBlock: true
        },
        {
            id: crypto.randomUUID(),
            type: 'Prayer',
            title: "Jumu'ah — Spiritual Reset",
            durationMinutes: 90, // 12:15 - 01:45 = 1 hour 30 mins
            startTime: '12:15',
            endTime: '13:45', // 24-hr format
            notes: ['No Pomodoro tracking', 'No productivity scoring impact'],
            isMarathonBlock: true
        },
        {
            id: crypto.randomUUID(),
            type: 'Study',
            title: 'Block 2 — CS & Chemistry',
            durationMinutes: 240, // 01:45 PM - 05:45 PM = 4 hours
            startTime: '13:45',
            endTime: '17:45',
            pomodorosCount: 4,
            workDuration: 50,
            breakDuration: 10,
            subjects: ['Computer Science: Control Statements', 'Chemistry: Chemical Bonding'],
            notes: ['“Minimum 5 problems per Pomodoro.”'],
            isMarathonBlock: true
        },
        {
            id: crypto.randomUUID(),
            type: 'Break',
            title: "Iftar — Recharge Window",
            durationMinutes: 165, // 05:45 PM - 08:30 PM = 2 hours 45 mins
            startTime: '17:45',
            endTime: '20:30',
            notes: ['No Pomodoros', 'Tree Impact: Neutral'],
            isMarathonBlock: true
        },
        {
            id: crypto.randomUUID(),
            type: 'Study',
            title: 'Block 3 — Night Rider Session',
            durationMinutes: 240, // 08:30 PM - 12:30 AM = 4 hours
            startTime: '20:30',
            endTime: '00:30',
            pomodorosCount: 4,
            workDuration: 50,
            breakDuration: 10,
            subjects: ['Organic Chemistry: Hydrocarbons, Ozonolysis', 'English: Summaries'],
            notes: ['“Focus on retention, not speed.”'],
            isMarathonBlock: true
        }
    ];
};
