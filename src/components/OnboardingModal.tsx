import React from 'react';
import { useStore } from '../stores/useStore';
import { getMarathonSchedule } from '../lib/marathonSchedule';

export const OnboardingModal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const handleStartEmpty = () => {
        useStore.getState().updateSettings({ hasSeenOnboarding: true });
        onComplete();
    };

    const handleUseSample = async () => {
        // Just directly pump the sample into today
        const sampleBlocks = getMarathonSchedule();
        const totalPomodoros = sampleBlocks.reduce((sum, b) => sum + (b.isMarathonBlock ? (b.pomodorosCount ?? 1) : 0), 0);
        await useStore.getState().updateToday({
            blocks: sampleBlocks,
            totalPomodoros,
            completedPomodoros: 0,
        });
        useStore.getState().updateSettings({ hasSeenOnboarding: true, hardMode: true, focusTreeEnabled: true });
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[100000] bg-charcoal-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-white/10 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-accent-500/10 text-accent-500 rounded-full flex items-center justify-center">
                    <img src="/logo.png" alt="FocusGrid Logo" className="w-10 h-10 object-contain" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome to FocusGrid</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    A clinical study manager designed to rebuild your focus. FocusGrid is entirely blank by default.
                    You must actively build your execution plan.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleStartEmpty}
                        className="w-full py-4 px-6 bg-accent-500 text-charcoal-950 font-bold rounded-xl hover:bg-accent-400 active:scale-[0.98] transition-all tracking-wide"
                    >
                        Start Empty
                    </button>

                    <button
                        onClick={handleUseSample}
                        className="w-full py-4 px-6 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all group"
                    >
                        <span className="group-hover:text-accent-400 transition-colors">Start with Demo Template</span>
                        <p className="text-xs text-gray-500 mt-1 font-normal group-hover:text-gray-400 transition-colors">14-Pomodoro Physics Marathon</p>
                    </button>
                </div>
            </div>
        </div>
    );
};
