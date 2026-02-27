import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationManager } from '../lib/notificationManager';

interface Props {
    onDone: () => void;
}

export const NotificationPermissionModal: React.FC<Props> = ({ onDone }) => {
    const handleEnable = async () => {
        await notificationManager.requestPermission();
        onDone();
    };

    const handleLater = () => {
        notificationManager.markAsked(); // sets notifAsked
        onDone();
    };

    return (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="glass-panel p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5 animate-in zoom-in-95 duration-300"
                style={{ borderColor: 'rgba(16,185,129,0.2)', boxShadow: '0 0 40px rgba(16,185,129,0.08)' }}
            >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                    <Bell size={24} className="text-accent-500" />
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>
                        Enable Notifications
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--surface-muted)' }}>
                        Receive system alerts for Pomodoro transitions, breaks, and session completions — even when the tab is minimized.
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--surface-muted)' }}>
                        Works while tab is open. Closed browser requires a backend push service.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={handleLater}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                            backgroundColor: 'var(--surface-border)',
                            color: 'var(--surface-muted)',
                        }}
                    >
                        <BellOff size={14} />
                        Later
                    </button>
                    <button
                        onClick={handleEnable}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-accent-500 text-white hover:bg-accent-600 transition-all duration-200"
                    >
                        <Bell size={14} />
                        Enable
                    </button>
                </div>
            </div>
        </div>
    );
};
