import React, { useState } from 'react';
import { useStore } from '../stores/useStore';
import { getMarathonSchedule } from '../lib/marathonSchedule';
import { ChevronRight, ChevronLeft, Shield, Clock, FileJson, Grid, Target } from 'lucide-react';

export const OnboardingModal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const handleUseSample = async () => {
        const sampleBlocks = getMarathonSchedule();
        const totalPomodoros = sampleBlocks.reduce((sum, b) => sum + (b.isMarathonBlock ? (b.pomodorosCount ?? 1) : 0), 0);
        await useStore.getState().updateToday({
            blocks: sampleBlocks,
            totalPomodoros,
            completedPomodoros: 0,
        });
        useStore.getState().updateSettings({ hardMode: true, focusTreeEnabled: true });
        onComplete();
    };

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    const handleSkip = () => onComplete();

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center animate-in fade-in slide-in-from-right-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-accent-500/10 text-accent-500 rounded-2xl flex items-center justify-center border border-accent-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                            <Target className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Execution Over Intention.</h2>
                        <div className="text-gray-400 text-sm leading-relaxed space-y-4 text-left p-6 bg-white/5 rounded-xl border border-white/5">
                            <p><strong>FocusGrid</strong> is a clinical, day-based execution engine designed to rebuild your focus.</p>
                            <p>There are no infinite to-do lists here. You build your day using a <strong>Pomodoro engine</strong>, executing chunks of deep work measured against strict rest cycles.</p>
                            <p>As you complete work, a <strong>Focus Tree</strong> naturally grows. If you break discipline or skip sessions in Hard Mode, the tree takes damage.</p>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center animate-in fade-in slide-in-from-right-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <Grid className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Building Your Day</h2>
                        <div className="text-gray-400 text-sm leading-relaxed space-y-4 text-left p-6 bg-white/5 rounded-xl border border-white/5">
                            <p>FocusGrid starts <strong>completely empty</strong>. There are no default blocks.</p>
                            <p>You must actively configure your <strong>Execution Timeline</strong> by identifying blocks of study, deep work, or review.</p>
                            <p className="flex items-center gap-3">
                                <span className="p-1 px-3 bg-white/10 text-white rounded font-mono text-xs font-bold border border-white/10 shrink-0">Add Block</span>
                                <span>Define title, duration, work/break ratios, and target subjects.</span>
                            </p>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center animate-in fade-in slide-in-from-right-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20">
                            <FileJson className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Portability & AI</h2>
                        <div className="text-gray-400 text-sm leading-relaxed space-y-4 text-left p-6 bg-white/5 rounded-xl border border-white/5">
                            <p>FocusGrid is powered entirely by <strong>JSON configurations</strong>.</p>
                            <ul className="list-disc list-inside space-y-2 ml-1">
                                <li><strong>Export</strong>: Download your meticulously planned schedules as JSON files to back them up securely.</li>
                                <li><strong>Templates</strong>: Save a perfect day as a Blueprint internally.</li>
                                <li><strong>AI Generation</strong>: You can prompt external AI (ChatGPT, Claude) to build hyper-optimized JSON schedules and paste them directly into the <strong>Quick Import</strong> field.</li>
                            </ul>
                            <p className="text-xs text-purple-400 font-medium">Navigate to <span className="font-bold">Settings {'->'} Documentation</span> later to view full schemas.</p>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center animate-in fade-in slide-in-from-right-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 border-t-red-500">
                            <Clock className="w-8 h-8 -rotate-12 transition-transform" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Deep Focus Mechanics</h2>
                        <div className="text-gray-400 text-sm leading-relaxed space-y-4 text-left p-6 bg-white/5 rounded-xl border border-white/5">
                            <p>When you start a session, the system enters <strong>Focus Mode</strong>, dominating your screen.</p>
                            <p><strong>The Alarm System</strong> utilizes distinctive synthetic tones (Chimes, Digital, Gong) that loop until manually acknowledged.</p>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <strong>Hard Mode:</strong> An extreme setting where failure to acknowledge an alarm quickly causes permanent visual damage to your Focus Tree metrics.
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="text-center animate-in fade-in slide-in-from-right-4">
                        <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Total Data Ownership</h2>
                        <div className="text-gray-400 text-sm leading-relaxed space-y-4 text-left p-6 bg-white/5 rounded-xl border border-white/5">
                            <p>FocusGrid operates completely <strong>Local-First</strong>.</p>
                            <ul className="list-disc list-inside space-y-2 ml-1">
                                <li>No backend servers. No cloud databases.</li>
                                <li>Everything is stored locally in your browser leveraging <strong className="text-white">IndexedDB</strong>.</li>
                                <li>You own your focus data unconditionally. Ensure you export backups frequently.</li>
                            </ul>
                            <p className="font-medium text-emerald-400 text-center mt-6">You are cleared to begin.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100000] bg-charcoal-950/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-charcoal-900 border border-white/10 p-6 md:p-10 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col min-h-[500px]">

                <div className="flex-1 flex flex-col justify-center">
                    {renderStepContent()}
                </div>

                {/* Footer Controls */}
                <div className="mt-8 pt-6 border-t border-white/5">
                    {/* Progress indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-accent-500' : i + 1 < step ? 'w-4 bg-white/20' : 'w-4 bg-white/5'}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        {step === 1 ? (
                            <button
                                onClick={handleSkip}
                                className="px-4 py-2 text-sm text-gray-500 font-medium hover:text-white transition-colors"
                            >
                                Skip Guide
                            </button>
                        ) : (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 text-sm flex items-center gap-1 text-gray-400 font-medium hover:text-white transition-colors"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                        )}

                        {step < totalSteps ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                            >
                                Continue <ChevronRight size={16} />
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUseSample}
                                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-xl transition-all"
                                >
                                    Load Demo Template
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="px-6 py-2.5 bg-accent-500 hover:bg-accent-400 text-charcoal-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                >
                                    Start Building
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
