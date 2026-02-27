import React from 'react';
import { useStore } from '../stores/useStore';
import { useTheme } from '../lib/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';
import { DataManagement } from './DataManagement';

export const Settings: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="pb-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--surface-text)' }}>Settings</h2>
                <p style={{ color: 'var(--surface-muted)' }}>Configure your environment.</p>
            </header>

            <div className="glass-panel p-6 w-full max-w-4xl mx-auto overflow-hidden">
                <div className="space-y-6">

                    {/* Theme Selector */}
                    <div className="pb-6 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                        <h3 className="font-semibold mb-3" style={{ color: 'var(--surface-text)' }}>Theme</h3>
                        <div className="flex gap-2">
                            {([
                                { id: 'dark', label: 'Dark', icon: Moon },
                                { id: 'system', label: 'System', icon: Monitor },
                                { id: 'light', label: 'Light', icon: Sun },
                            ] as const).map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setTheme(id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    style={{
                                        backgroundColor: theme === id ? 'rgba(16,185,129,0.15)' : 'var(--surface-border)',
                                        color: theme === id ? '#10b981' : 'var(--surface-muted)',
                                        border: theme === id ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                                    }}
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* General Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Hard Mode</h3>
                                <p className="text-sm text-gray-400">15s repeating alarms, skip logging.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ hardMode: !settings.hardMode })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.hardMode ? 'bg-red-500' : 'bg-gray-700'}`}
                            >
                                <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.hardMode ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Focus Tree</h3>
                                <p className="text-sm text-gray-400">Show visual growth accountability.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ focusTreeEnabled: !settings.focusTreeEnabled })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.focusTreeEnabled ? 'bg-accent-500' : 'bg-gray-700'}`}
                            >
                                <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.focusTreeEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Floating Timer Always-On</h3>
                                <p className="text-sm text-gray-400">MiniPlayer stays active during navigation.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ floatingTimerEnabled: !settings.floatingTimerEnabled })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.floatingTimerEnabled ? 'bg-accent-500' : 'bg-gray-700'}`}
                            >
                                <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.floatingTimerEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Floating Timer Always-On</h3>
                                <p className="text-sm text-gray-400">MiniPlayer stays active during navigation.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ floatingTimerEnabled: !settings.floatingTimerEnabled })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.floatingTimerEnabled ? 'bg-accent-500' : 'bg-gray-700'}`}
                            >
                                <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.floatingTimerEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Global Volume</h3>
                                <p className="text-sm text-gray-400">{Math.round(settings.volume * 100)}%</p>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={settings.volume}
                                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                                className="w-1/2 accent-accent-500"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Vibration</h3>
                                <p className="text-sm text-gray-400">Haptic feedback on supported devices.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.vibrationEnabled ? 'bg-accent-500' : 'bg-gray-700'}`}
                            >
                                <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.vibrationEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Alarm Events Configuration */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">Alarm Events</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Object.keys(settings?.alarms || {}) as Array<keyof typeof settings.alarms>).map((eventKey) => {
                                const config = settings.alarms[eventKey];

                                const handleUpdateConfig = (updates: Partial<typeof config>) => {
                                    updateSettings({
                                        alarms: { ...settings.alarms, [eventKey]: { ...config, ...updates } }
                                    });
                                };

                                return (
                                    <div key={eventKey} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-white font-bold capitalize">{eventKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                            <button
                                                onClick={() => handleUpdateConfig({ enabled: !config.enabled })}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${config.enabled ? 'bg-accent-500' : 'bg-gray-700'}`}
                                            >
                                                <span className={`block w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        <div className={`space-y-3 transition-opacity ${config.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                            <div className="flex flex-col gap-2 text-sm pt-2 border-t border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400">Audio Source</span>
                                                    <select
                                                        className="bg-charcoal-900 text-white rounded px-2 py-1 outline-none border border-white/10"
                                                        value={config.soundType}
                                                        onChange={(e) => handleUpdateConfig({ soundType: e.target.value as any })}
                                                    >
                                                        <option value="synthetic">Synthetic</option>
                                                        <option value="custom">Custom Tones</option>
                                                    </select>
                                                </div>

                                                {config.soundType === 'synthetic' ? (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-gray-400">Tone</span>
                                                        <select
                                                            className="bg-charcoal-900 text-white rounded px-2 py-1 outline-none border border-white/10"
                                                            value={config.syntheticTone}
                                                            onChange={(e) => handleUpdateConfig({ syntheticTone: e.target.value as any })}
                                                        >
                                                            <option value="classic">Classic</option>
                                                            <option value="digital">Digital</option>
                                                            <option value="chime">Chime</option>
                                                            <option value="gong">Gong</option>
                                                            <option value="urgent">Urgent</option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-2 mt-2">
                                                        <span className="text-gray-400">Custom Audio File</span>
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-accent-500/20 file:text-accent-500 hover:file:bg-accent-500/30"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => {
                                                                        if (ev.target?.result) {
                                                                            handleUpdateConfig({ customSoundData: ev.target.result.toString() });
                                                                        }
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                        {config.customSoundData && <span className="text-[10px] text-accent-500">Audio uploaded successfully!</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="w-full text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white py-2 rounded transition-colors"
                                                onClick={() => {
                                                    // Test Audio
                                                    import('../lib/audioManager').then(({ audioManager }) => {
                                                        audioManager.playAlarm(config, settings.volume, settings.vibrationEnabled).catch(console.error);
                                                    });
                                                }}
                                            >
                                                Preview Alarm
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div className="pt-6 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                        <DataManagement />
                    </div>
                </div>
            </div>
        </div>
    );
};
