import React, { useState, useEffect } from 'react';
import { Calendar, Inbox, Settings as SettingsIcon, LayoutGrid, Volume2 } from 'lucide-react';
import { audioManager } from '../lib/audioManager';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'today', label: 'Today', icon: LayoutGrid },
        { id: 'tomorrow', label: 'Tomorrow', icon: Calendar },
        { id: 'archive', label: 'Archive', icon: Inbox },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];

    const [audioEnabled, setAudioEnabled] = useState(false);

    useEffect(() => {
        setAudioEnabled(audioManager.isReady);
    }, []);

    const handleEnableAudio = async () => {
        await audioManager.init();
        setAudioEnabled(true);
    };

    // Infer if dark mode is active by checking the html class
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <div
            className="flex h-screen w-full font-sans relative"
            style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--surface-text)' }}
        >
            {/* Audio Failsafe Banner */}
            {!audioEnabled && (
                <div className="absolute top-0 inset-x-0 z-50 bg-red-500 text-white px-4 py-3 flex items-center justify-center gap-4 shadow-lg animate-in slide-in-from-top-4">
                    <span className="font-bold flex items-center gap-2">
                        <Volume2 size={18} /> Sound requires permission. Alarms will not play!
                    </span>
                    <button
                        onClick={handleEnableAudio}
                        className="bg-white text-red-500 font-bold px-4 py-1.5 rounded hover:bg-red-50 transition-colors text-sm"
                    >
                        Enable Audio
                    </button>
                </div>
            )}

            {/* Sidebar Navigation */}
            <aside
                className="w-60 flex-shrink-0 flex flex-col items-center py-8 transition-colors duration-300"
                style={{
                    borderRight: '1px solid var(--surface-border)',
                    backgroundColor: isDark ? 'rgba(18,18,21,0.6)' : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-12 px-6 w-full">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg animate-in zoom-in duration-500">
                        <img src="/logo.png" alt="FocusGrid Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
                        FocusGrid
                    </h1>
                </div>

                {/* Nav */}
                <nav className="flex-1 w-full px-3 flex flex-col gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id || (activeTab.startsWith('add-block') && item.id === 'today');
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                                style={{
                                    backgroundColor: isActive
                                        ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.08)'
                                        : 'transparent',
                                    color: isActive
                                        ? 'var(--surface-text)'
                                        : 'var(--surface-muted)',
                                    fontWeight: isActive ? '600' : '400',
                                }}
                            >
                                <Icon
                                    size={18}
                                    style={{ color: isActive ? '#10b981' : 'var(--surface-muted)' }}
                                />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto min-h-0 flex flex-col">
                <div className="flex-1 p-8 max-w-5xl mx-auto w-full flex flex-col relative z-10">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
};
