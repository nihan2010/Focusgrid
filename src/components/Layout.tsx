import React, { useState, useEffect } from 'react';
import { Calendar, Inbox, Settings as SettingsIcon, LayoutGrid, Volume2, HardDriveDownload } from 'lucide-react';
import { useStore } from '../stores/useStore';
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

    const { settings, updateSettings, archivedRecords } = useStore();
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [showBackupBanner, setShowBackupBanner] = useState(false);

    useEffect(() => {
        setAudioEnabled(audioManager.isReady);
    }, []);

    useEffect(() => {
        if (!settings.lastBackupDate) {
            if (archivedRecords.length > 2) setShowBackupBanner(true);
        } else {
            const daysSince = (Date.now() - new Date(settings.lastBackupDate).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince >= 7) setShowBackupBanner(true);
        }
    }, [settings.lastBackupDate, archivedRecords.length]);

    const handleSnoozeBackup = () => {
        setShowBackupBanner(false);
        // Snooze for 3 days by faking a recent backup
        const snoozeDate = new Date();
        snoozeDate.setDate(snoozeDate.getDate() - 4); // so 3 days from now it will trigger (since 4 + 3 = 7)
        updateSettings({ lastBackupDate: snoozeDate.toISOString() });
    };

    const handleEnableAudio = async () => {
        await audioManager.init();
        setAudioEnabled(true);
    };

    // Infer if dark mode is active by checking the html class
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <div
            className="flex flex-col lg:flex-row h-screen w-full font-sans relative overflow-x-hidden"
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

            {/* Weekly Backup Reminder Banner */}
            {audioEnabled && showBackupBanner && (
                <div className="absolute top-0 inset-x-0 z-[45] bg-blue-600 text-white px-4 py-3 flex lg:flex-row flex-col items-center justify-center gap-4 shadow-lg animate-in slide-in-from-top-4">
                    <span className="font-bold flex items-center gap-2 text-sm lg:text-base">
                        <HardDriveDownload size={18} /> You haven't backed up your JSON data recently!
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowBackupBanner(false); setActiveTab('settings'); }}
                            className="bg-white text-blue-600 font-bold px-4 py-1.5 rounded hover:bg-blue-50 transition-colors text-sm"
                        >
                            Go to Backup
                        </button>
                        <button
                            onClick={handleSnoozeBackup}
                            className="bg-white/20 text-white font-medium px-4 py-1.5 rounded hover:bg-white/30 transition-colors text-sm"
                        >
                            Snooze
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar Navigation - Desktop only */}
            <aside
                className="hidden lg:flex w-64 flex-shrink-0 flex-col items-center py-8 transition-colors duration-300"
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
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
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
                                    size={20}
                                    style={{ color: isActive ? '#10b981' : 'var(--surface-muted)' }}
                                />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Bottom Nav - Mobile only */}
            <nav
                className="lg:hidden fixed bottom-0 inset-x-0 z-[60] flex items-center justify-around px-2 py-3 border-t border-white/5 bg-black/40 backdrop-blur-2xl"
                style={{ borderTopColor: 'var(--surface-border)' }}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id || (activeTab.startsWith('add-block') && item.id === 'today');
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="flex flex-col items-center gap-1.5 px-3 py-1 rounded-lg transition-all duration-200"
                            style={{
                                color: isActive ? '#10b981' : 'var(--surface-muted)',
                            }}
                        >
                            <Icon size={24} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Header (Logo) - Mobile only */}
            <div className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-lg shrink-0"
                style={{ borderBottomColor: 'var(--surface-border)' }}>
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg" />
                    <span className="font-black tracking-tight text-white uppercase text-sm">FocusGrid</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto min-h-0 flex flex-col pb-24 lg:pb-0">
                <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col relative z-10">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
};
