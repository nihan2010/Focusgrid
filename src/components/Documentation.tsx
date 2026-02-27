import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, HardDrive, FileJson, Info } from 'lucide-react';
import { getMarathonSchedule } from '../lib/marathonSchedule';

export const Documentation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [copied, setCopied] = useState(false);

    const schemaExample = `{
  "date": "2026-03-01",
  "blocks": [
    {
      "id": "block-1",
      "title": "Deep Work - Alpha",
      "type": "Study",
      "startTime": "06:00",
      "endTime": "10:00",
      "workDuration": 50,
      "breakDuration": 10
    }
  ]
}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(schemaExample);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDownload = () => {
        const blocks = getMarathonSchedule();
        const demoJson = JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            blocks
        }, null, 2);

        const blob = new Blob([demoJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusgrid-demo.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (confirm("Reset the onboarding flag? You will see the setup wizard on next reload.")) {
            localStorage.removeItem('focusgridOnboarded');
            window.location.reload();
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-32">
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Settings
            </button>

            <div className="mb-10 border-b border-white/5 pb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">FocusGrid Documentation</h1>
                <p className="text-gray-400 text-lg">System operations, schema definitions, and AI workflows.</p>
            </div>

            <div className="space-y-12">
                {/* Section 1: Data Integrity */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <HardDrive className="text-emerald-500" /> 1. Data Integrity & Backups
                    </h2>
                    <div className="prose prose-invert max-w-none text-gray-300">
                        <p>FocusGrid is a <strong>purely local-first</strong> application. This means there is no cloud syncing, no databases on our servers, and no telemetry.</p>
                        <ul className="space-y-2 mt-4">
                            <li>All data lives natively in your browser via <strong>IndexedDB</strong>.</li>
                            <li>If you clear your browser data or use incognito mode, you will permanently lose your schedule logs.</li>
                            <li><strong>Rule of thumb:</strong> Export your data using the Data Management panel at least once a week. The system will banner you if it detects a backup delay &gt; 7 days.</li>
                        </ul>
                        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4">
                            <Info className="shrink-0 text-blue-400 mt-1" />
                            <div className="text-sm">
                                <strong className="text-white block mb-1">Daily Snapshots</strong>
                                FocusGrid automatically takes a snapshot of your timeline at midnight. If you ever mistakenly overwrite "Today" with a template, you can hit <strong>Restore Previous Day</strong> in Data Management.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: AI Input */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <FileJson className="text-accent-500" /> 2. AI Scheduling via JSON
                    </h2>
                    <div className="prose prose-invert max-w-none text-gray-300 mb-6">
                        <p>Because the core engine is JSON-driven, you can instruct AI models like Claude or ChatGPT to build complete, complex schedules for you, and inject them instantly using the <strong>Quick AI Input</strong> tool.</p>
                    </div>

                    <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 mb-6">
                        <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
                            <span className="text-xs font-mono text-gray-400">schema-example.json</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                    title="Copy Schema"
                                >
                                    <Copy size={16} />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                    title="Download Full Demo JSON"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                            <code>{schemaExample}</code>
                        </pre>
                        {copied && <div className="px-4 py-2 bg-accent-500/20 text-accent-500 text-xs text-center border-t border-accent-500/20">Copied to clipboard</div>}
                    </div>

                    <p className="text-sm text-gray-400">
                        In Data Management, click <strong>Get AI Prompt</strong> to instantly copy the exact system ruleset needed to prompt an AI perfectly model our schema.
                    </p>
                    <p className="text-xs text-purple-400 font-medium mt-4">Navigate to <span className="font-bold">Settings -{'>'} Documentation</span> later to view full schemas.</p>
                </section>

                {/* Section 3: Troubleshooting */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">3. System Operations</h2>

                    <div className="space-y-4">
                        <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
                            <h3 className="text-white font-bold mb-2">My audio alarms aren't firing accurately</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">Browsers aggressively throttle Javascript when tabs are in the background or minimized. FocusGrid uses a custom Web Worker to bypass this, but for deep work sessions, it is <strong>highly recommended</strong> to keep the FocusGrid tab visible or use the floating MiniPlayer.</p>
                        </div>

                        <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
                            <h3 className="text-white font-bold mb-2">Hard Mode Penalties</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">If Hard Mode is enabled, failing to acknowledge a break alarm within 15 seconds, or manually skipping a session, permanently corrupts the Focus Tree visualization. This cannot be undone by importing JSON over the day.</p>
                        </div>

                        <div className="pt-6 border-t border-red-500/20 mt-8">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                            >
                                Trigger Onboarding Reset
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Resets the local `focusgridOnboarded` flag for debugging purposes.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
