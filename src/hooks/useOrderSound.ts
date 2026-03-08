"use client";

/**
 * useOrderSound — plays a pleasant "ding" notification sound
 * using the Web Audio API (no external files needed).
 * Also requests browser notification permission on mount.
 */

export function playOrderSound() {
    if (typeof window === "undefined") return;

    try {
        const ctx = new AudioContext();

        const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime);

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Play a pleasant 3-note "ding ding ding" chord sequence
        const now = ctx.currentTime;
        playTone(1047, now, 0.5, 0.4);       // C6
        playTone(1319, now + 0.15, 0.5, 0.3); // E6
        playTone(1568, now + 0.3, 0.7, 0.3);  // G6
    } catch (err) {
        console.warn("Audio playback failed:", err);
    }
}

export async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }
}

export function showBrowserNotification(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
        body,
        icon: "/admin-logo.png",
        badge: "/admin-logo.png",
        tag: "new-order",
        requireInteraction: true,
    });
}
