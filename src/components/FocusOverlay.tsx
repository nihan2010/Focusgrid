import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { FocusTree } from './FocusTree';
import { MiniPlayer } from './MiniPlayer';
import { notificationManager } from '../lib/notificationManager';

export const FocusOverlay: React.FC = () => {
    const {
        timerRunning, activeBlockId, today, stopSession, updateToday, updateBlock,
        triggerAlarm, marathonState, settings, isMiniPlayer, minimizeSession, expandSession,
        restoredTimeMs, clearRestoredTime,
    } = useStore();
    const [timeLeftMs, setTimeLeftMs] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [skipReason, setSkipReason] = useState('');
    const [showSkipModal, setShowSkipModal] = useState(false);

    const workerRef = useRef<Worker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const activeBlock = today?.blocks.find(b => b.id === activeBlockId);
    const isMarathonActive = marathonState?.isActive && marathonState.blockId === activeBlockId;

    // Initialize Timer and Web Worker for non-marathon blocks
    useEffect(() => {
        if (!timerRunning || !activeBlock || isMarathonActive) {
            if (workerRef.current) {
                workerRef.current.postMessage({ action: 'stop' });
                workerRef.current.terminate();
                workerRef.current = null;
            }
            return;
        }

        // Seed timer: use restored time if available (page reload), otherwise use full block duration
        const initialMs = restoredTimeMs !== null ? restoredTimeMs : (activeBlock.durationMinutes || 50) * 60 * 1000;
        if (restoredTimeMs !== null) clearRestoredTime(); // consume it — only seed once
        setTimeLeftMs(initialMs);

        const worker = new Worker(new URL('../workers/timer.ts', import.meta.url), { type: 'module' });
        workerRef.current = worker;

        worker.onmessage = (e) => {
            if (e.data.type === 'tick') {
                const delta = e.data.delta;
                setTimeLeftMs(prev => {
                    const next = prev - delta;
                    if (next <= 0) {
                        handleSessionComplete();
                        return 0;
                    }
                    return next;
                });
            }
        };

        worker.postMessage({ action: 'start', interval: 1000 });

        return () => {
            worker.postMessage({ action: 'stop' });
            worker.terminate();
        };
    }, [timerRunning, activeBlock?.id, isMarathonActive]);

    const handleSessionComplete = () => {
        if (!activeBlock) return;

        if (!isMarathonActive) {
            // Fire notification
            if (activeBlock.type === 'break') {
                notificationManager.notifyBreakEnd();
                if (settings.hardMode) notificationManager.startHardModeAlert(activeBlock.title, 'Break Over');
            } else {
                notificationManager.notifyPomodoroEnd(activeBlock.title, 'Pomodoro Complete');
                if (settings.hardMode) notificationManager.startHardModeAlert(activeBlock.title, 'Work Complete');
            }

            triggerAlarm({
                title: activeBlock.type === 'break' ? 'Break Over' : 'Pomodoro Complete',
                subtitle: activeBlock.type === 'break' ? 'Time to execute.' : 'Take a well-deserved rest.',
                eventType: activeBlock.type === 'break' ? 'breakEnd' : 'workEnd'
            });

            if (today) {
                updateBlock('today', activeBlock.id, { completed: true });

                if (activeBlock.type !== 'break') {
                    updateToday({
                        completedPomodoros: today.completedPomodoros + 1,
                        totalStudyMinutes: today.totalStudyMinutes + (activeBlock.durationMinutes || 0)
                    });
                } else {
                    updateToday({
                        totalBreakMinutes: today.totalBreakMinutes + (activeBlock.durationMinutes || 0)
                    });
                }
            }
        }
        stopSession();
    };

    const handleAttemptStop = () => {
        if (settings.hardMode && isMarathonActive) {
            setShowSkipModal(true);
        } else {
            stopSession();
        }
    };

    const confirmSkip = () => {
        if (skipReason.trim() === '') return;
        if (today) {
            updateToday({
                skippedSessions: today.skippedSessions + 1,
                distractions: [...today.distractions, skipReason]
            });
        }
        setShowSkipModal(false);
        setSkipReason('');
        stopSession();
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    if (!timerRunning || !activeBlock) return null;

    const activeTimeLeftMs = isMarathonActive ? (marathonState?.timeLeftMs || 0) : timeLeftMs;
    const progressPercent = isMarathonActive
        ? (marathonState?.progressPercent || 0)
        : 100 - (activeTimeLeftMs / ((activeBlock.durationMinutes || 50) * 60000)) * 100;

    const minutes = Math.floor(activeTimeLeftMs / 60000);
    const seconds = Math.floor((activeTimeLeftMs % 60000) / 1000);

    // Marathon tree calculates specifically off 14 pomodoros
    const treeProgress = isMarathonActive && today
        ? Math.min((today.completedPomodoros / 14) * 100, 100)
        : progressPercent;

    if (isMiniPlayer) {
        return (
            <div className="pointer-events-none fixed inset-0 z-[100]">
                <div className="pointer-events-auto">
                    <MiniPlayer
                        activeBlock={activeBlock}
                        isMarathonActive={isMarathonActive || false}
                        marathonState={marathonState}
                        minutes={minutes}
                        seconds={seconds}
                        progressPercent={progressPercent}
                        treeProgress={treeProgress}
                        onExpand={expandSession}
                        onStop={handleAttemptStop}
                    />
                </div>

                {showSkipModal && (
                    <div className="pointer-events-auto fixed inset-0 z-[110] bg-charcoal-950/80 flex items-center justify-center p-4">
                        <div className="glass-panel p-8 max-w-md w-full animate-in zoom-in-95 duration-200 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2">Abandon Session?</h3>
                            <p className="text-gray-400 mb-6 text-sm">Hard Mode is active. You must provide a reason for pausing or skipping this session. Your tree will be damaged.</p>

                            <input
                                autoFocus
                                type="text"
                                value={skipReason}
                                onChange={e => setSkipReason(e.target.value)}
                                placeholder="Why are you stopping?"
                                className="w-full bg-charcoal-950 border border-white/10 rounded-lg p-3 text-white mb-6 focus:outline-none focus:border-red-500 transition-colors"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSkipModal(false)}
                                    className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    Resume
                                </button>
                                <button
                                    onClick={confirmSkip}
                                    disabled={skipReason.trim() === ''}
                                    className="px-4 py-2 bg-red-500/20 text-red-500 font-medium rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit & Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 bg-charcoal-950 flex flex-col items-center overflow-y-auto overflow-x-hidden animate-in fade-in duration-500"
        >
            {/* Background Pulse */}
            <div
                className="absolute inset-0 bg-accent-500/5 transition-opacity duration-1000"
                style={{ opacity: timerRunning ? 0.05 + progressPercent * 0.001 : 0 }}
            />

            {!showSkipModal && (
                <button
                    onClick={handleAttemptStop}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                    <X size={24} />
                </button>
            )}

            {!showSkipModal && (
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
            )}

            {!showSkipModal && (
                <button
                    onClick={minimizeSession}
                    className="absolute top-8 left-20 text-gray-500 hover:text-white transition-colors px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 font-medium text-sm border border-white/5 shadow-lg"
                >
                    Hide
                </button>
            )}

            <div className={`relative z-10 flex flex-col items-center m-auto py-12 px-4 text-center w-full max-w-4xl ${showSkipModal ? 'blur-sm' : ''}`}>
                <h2 className="text-xl md:text-2xl font-medium text-gray-400 mb-2 uppercase tracking-widest">{activeBlock.title}</h2>
                {isMarathonActive && (
                    <div className="text-accent-500 font-medium mb-6 uppercase tracking-widest text-sm md:text-lg">
                        {marathonState?.sessionName}
                    </div>
                )}
                {!isMarathonActive && <div className="mb-6" />}

                {/* Giant Timer */}
                <div className="text-[clamp(4.5rem,15vw,10rem)] leading-none font-black text-white tabular-nums tracking-tighter mb-8 md:mb-12 drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>

                {/* Tree Graphic Container */}
                <div className="w-[clamp(6rem,18vw,14rem)] h-[clamp(6rem,18vw,14rem)] relative mb-8 md:mb-12">
                    <FocusTree progress={treeProgress} isDamaged={(today?.skippedSessions ?? 0) > 0} />
                </div>

                <p className="text-gray-500 text-xs md:text-base px-6">
                    {isMarathonActive
                        ? (marathonState?.phase === 'work' ? "Stay focused. Your grit manifests growth." : "Rest up. Prepare for the next sprint.")
                        : "Stay focused. The tree is growing."}
                </p>

                {isMarathonActive && activeBlock.subjects && marathonState?.phase === 'work' && (
                    <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 max-w-2xl px-4">
                        {activeBlock.subjects.map(sub => (
                            <span key={sub} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">{sub}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Progress Bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/5">
                <div
                    className="h-full bg-accent-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {showSkipModal && (
                <div className="absolute z-50 glass-panel p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-white mb-2">Abandon Session?</h3>
                    <p className="text-gray-400 mb-6 text-sm">Hard Mode is active. You must provide a reason for pausing or skipping this session. Your tree will be damaged.</p>

                    <input
                        autoFocus
                        type="text"
                        value={skipReason}
                        onChange={e => setSkipReason(e.target.value)}
                        placeholder="Why are you stopping?"
                        className="w-full bg-charcoal-950 border border-white/10 rounded-lg p-3 text-white mb-6 focus:outline-none focus:border-red-500 transition-colors"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowSkipModal(false)}
                            className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Resume
                        </button>
                        <button
                            onClick={confirmSkip}
                            disabled={skipReason.trim() === ''}
                            className="px-4 py-2 bg-red-500/20 text-red-500 font-medium rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit & Exit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
