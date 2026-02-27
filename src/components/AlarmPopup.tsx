import React, { useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { audioManager } from '../lib/audioManager';

export const AlarmPopup: React.FC = () => {
    const { activeAlarmInfo, dismissAlarm, settings } = useStore();

    useEffect(() => {
        if (activeAlarmInfo) {
            // Play sound securely with optional chaining
            const alarmConfig = settings?.alarms?.[activeAlarmInfo.eventType];
            if (alarmConfig && alarmConfig.enabled) {
                audioManager.playAlarm(alarmConfig, settings.volume, settings.vibrationEnabled).catch(console.error);

                // Show browser notification
                if (Notification.permission === 'granted') {
                    new Notification(activeAlarmInfo.title, {
                        body: activeAlarmInfo.subtitle,
                        icon: '/vite.svg',
                        requireInteraction: true
                    });
                }
            }

            // Hard mode: interval timer if it's a completing event and Hard Mode is on
            let hardModeInterval: ReturnType<typeof setInterval>;
            if (settings.hardMode && activeAlarmInfo.eventType.includes('End')) {
                hardModeInterval = setInterval(() => {
                    if (alarmConfig && alarmConfig.enabled) {
                        audioManager.playAlarm(alarmConfig, settings.volume, settings.vibrationEnabled).catch(console.error);
                    }
                }, 15000);
            }

            return () => {
                if (hardModeInterval) clearInterval(hardModeInterval);
            };
        }
    }, [activeAlarmInfo, settings.alarms, settings.volume, settings.vibrationEnabled, settings.hardMode]);

    if (!activeAlarmInfo) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-charcoal-950/80 backdrop-blur-md">
            <div className="absolute inset-x-0 top-0 h-2 bg-red-500 animate-pulse" />
            <div className="absolute inset-x-0 bottom-0 h-2 bg-red-500 animate-pulse" />
            <div className="absolute inset-y-0 left-0 w-2 bg-red-500 animate-pulse" />
            <div className="absolute inset-y-0 right-0 w-2 bg-red-500 animate-pulse" />

            <div className="glass-panel border-red-500/50 p-10 max-w-lg w-full mx-4 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-6">
                    <span className="text-4xl font-black">!</span>
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">{activeAlarmInfo.title}</h2>
                <p className="text-xl text-gray-300 mb-10">{activeAlarmInfo.subtitle}</p>

                <button
                    onClick={dismissAlarm}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-xl py-5 rounded-xl transition-colors uppercase tracking-widest shadow-lg"
                >
                    Acknowledge & Continue
                </button>

                {settings.hardMode && (
                    <p className="mt-6 text-sm text-red-400 font-medium">Hard Mode Active: Alarm will repeat every 15s until acknowledged.</p>
                )}
            </div>
        </div>
    );
};
