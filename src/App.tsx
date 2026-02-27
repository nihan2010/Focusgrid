import { useEffect, useState } from 'react';
import { useStore } from './stores/useStore';
import { Layout } from './components/Layout';
import { Today } from './components/Today';
import { Tomorrow } from './components/Tomorrow';
import { Archive } from './components/Archive';
import { Settings } from './components/Settings';
import { AddBlock } from './components/AddBlock';
import { FocusOverlay } from './components/FocusOverlay';
import { AlarmPopup } from './components/AlarmPopup';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { OnboardingModal } from './components/OnboardingModal';
import { notificationManager } from './lib/notificationManager';

function App() {
  const { isInitialized, settings, initStore, globalTick, checkMidnightTransition, recalculateDailyProgress, sessionRestoreMessage, dismissRestoreMessage } = useStore();
  const [activeTab, setActiveTab] = useState('today');
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Diagnostic Mode Overlay Statuses
  const [diagnostic, setDiagnostic] = useState({
    hydration: 'Pending',
    dateSync: 'Pending',
    transition: 'Idle'
  });
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    initStore().then(() => {
      setDiagnostic(d => ({ ...d, hydration: 'Complete' }));
    }).catch(err => {
      console.error("Hydration Failed Globally", err);
      setDiagnostic(d => ({ ...d, hydration: 'FAILED' }));
    });
    // Register SW and notification manager on app boot
    notificationManager.registerServiceWorker();
  }, [initStore]);

  // Auto-dismiss session restore banner after 4s
  useEffect(() => {
    if (!sessionRestoreMessage) return;
    const t = setTimeout(() => dismissRestoreMessage(), 4000);
    return () => clearTimeout(t);
  }, [sessionRestoreMessage, dismissRestoreMessage]);

  // Fast 1s tick for active timers and alarms (Purely logical, does not trigger full re-mounts)
  useEffect(() => {
    if (!isInitialized) return;
    const interval = setInterval(() => {
      globalTick(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isInitialized, globalTick]);

  // Safe Date Sync Polling loop for Midnight Transitions (Runs every 30s safely)
  useEffect(() => {
    if (!isInitialized) return;

    // Check exactly once when components mount after hydration
    checkMidnightTransition();
    setDiagnostic(d => ({ ...d, dateSync: 'Stable' }));

    const datePoller = setInterval(() => {
      checkMidnightTransition();
    }, 30000);

    return () => clearInterval(datePoller);
  }, [isInitialized, checkMidnightTransition]);

  // 5-minute backup recalculation loop (primary triggers are event-driven)
  useEffect(() => {
    if (!isInitialized) return;
    const progressPoller = setInterval(() => {
      recalculateDailyProgress();
    }, 5 * 60 * 1000); // every 5 minutes
    return () => clearInterval(progressPoller);
  }, [isInitialized, recalculateDailyProgress]);

  // 4️⃣ Ensure App completely waits for DB hydration before rendering ANY child dashboards
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center text-accent-500 gap-4">
        <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full" />
        <p className="font-medium tracking-widest text-sm uppercase text-gray-400">Hydrating Data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Session Restore Banner */}
      {sessionRestoreMessage && (
        <div className="fixed top-0 inset-x-0 z-[99999] flex justify-center pointer-events-none">
          <div className="mt-3 px-5 py-2.5 bg-accent-500/10 border border-accent-500/30 text-accent-500 text-xs font-medium rounded-full backdrop-blur-sm shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
            {sessionRestoreMessage}
          </div>
        </div>
      )}
      {/* 🔥 DIAGNOSTIC MODE BANNER (TEMPORARY) */}
      {showDiagnostic && (
        <div className="fixed top-0 inset-x-0 z-[99999] bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-yellow-500">
          <span>FocusGrid Diagnostic Mode</span>
          <div className="flex gap-4 items-center">
            <span>Hydration: <b className="text-white">{diagnostic.hydration}</b></span>
            <span>Date Sync: <b className="text-white">{diagnostic.dateSync}</b></span>
            <span>Transition: <b className="text-white">{diagnostic.transition}</b></span>
            <button
              onClick={() => setShowDiagnostic(false)}
              className="ml-4 hover:text-white transition-colors"
              title="Close Diagnostic Mode"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* One-time Notification Permission Modal */}
      {showNotifModal && (
        <NotificationPermissionModal onDone={() => setShowNotifModal(false)} />
      )}

      {/* Extreme First-Launch Onboarding */}
      {(isInitialized && !settings.hasSeenOnboarding) && (
        <OnboardingModal onComplete={() => {
          // It updates store internally, component will naturally unmount via reactivity
          // Then we might ask for notifs next
          if (!notificationManager.hasBeenAsked()) setShowNotifModal(true);
        }} />
      )}

      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'today' && <Today setActiveTab={(t) => {
          // Show notification modal before first session if not asked yet
          // Using revised hasBeenAsked which checks 'notifAsked'
          if (!notificationManager.hasBeenAsked()) setShowNotifModal(true);
          setActiveTab(t);
        }} />}
        {activeTab === 'tomorrow' && <Tomorrow setActiveTab={setActiveTab} />}
        {activeTab === 'archive' && <Archive />}
        {activeTab === 'settings' && <Settings />}
        {activeTab.startsWith('add-block') && <AddBlock targetDay={activeTab.split(':')[1] || 'today'} onCancel={() => setActiveTab(activeTab.split(':')[1] || 'today')} />}
        <FocusOverlay />
        <AlarmPopup />
      </Layout>
    </>
  );
}

export default App;
