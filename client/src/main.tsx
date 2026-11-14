import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// =======================================================================
// Rock-Solid Mobile Game Viewport Lock
// Completely prevents mobile browser page zooming (double-tap zoom, pinch zoom,
// Safari gesture zoom, Ctrl+wheel zoom, and rubber-band elastic bouncing)
// =======================================================================
if (typeof window !== 'undefined') {
  // 1. Prevent iOS Safari two-finger gesture zoom and rotation
  const preventZoom = (e: Event) => e.preventDefault();
  document.addEventListener('gesturestart', preventZoom, { passive: false });
  document.addEventListener('gesturechange', preventZoom, { passive: false });
  document.addEventListener('gestureend', preventZoom, { passive: false });

  // 2. Prevent multi-finger pinch-to-zoom on Android Chrome & Safari
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 3. Prevent mobile double-tap to zoom (fast consecutive taps on pedals / buttons / screen)
  let lastTouchEndTime = 0;
  document.addEventListener(
    'touchend',
    (e: TouchEvent) => {
      const now = performance.now();
      if (now - lastTouchEndTime <= 300) {
        e.preventDefault();
        // If tapping an interactive button or element, dispatch click
        const target = e.target as HTMLElement | null;
        const clickable = target?.closest('button, a, [role="button"]') as HTMLElement | null;
        if (clickable && typeof clickable.click === 'function') {
          clickable.click();
        }
      }
      lastTouchEndTime = now;
    },
    { passive: false }
  );

  // 4. Prevent Ctrl + Wheel zoom on desktop trackpads / mice
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // 5. Prevent browser context menu on long-press (keeps gameplay immersive)
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
    e.preventDefault();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
