// A high-performance Web Worker for accurate timing
// This uses actual Date.now() differences to avoid setInterval throttling drift.

let timerInterval: ReturnType<typeof setInterval> | null = null;
let expectedNextTick = 0;
let lastTick = 0;

self.onmessage = (e) => {
    const { action, interval = 1000 } = e.data;

    if (action === 'start') {
        if (timerInterval) clearInterval(timerInterval);
        lastTick = Date.now();
        expectedNextTick = lastTick + interval;

        // We run a fast loop (100ms) but only emit ticks when the actual accumulated drift surpasses the required interval
        timerInterval = setInterval(() => {
            const now = Date.now();

            if (now >= expectedNextTick) {
                // We surpassed the expected time
                const drift = now - lastTick;

                lastTick = now;
                expectedNextTick = now + interval;

                // If drift is massively larger than the interval (e.g. > 10 seconds), 
                // it means the system slept / was paused. We send the full delta back so the UI compensates immediately.
                self.postMessage({ type: 'tick', delta: drift, wasSleeping: drift > (interval * 10) });
            }
        }, 100);
    } else if (action === 'stop') {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
};
