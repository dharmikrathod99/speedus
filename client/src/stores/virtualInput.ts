/**
 * Virtual Input & Mobile Touch Controls Manager
 * Direct mutable state access for 60 FPS zero-allocation physics loops.
 * Zero React re-renders during active gameplay.
 */

export interface VirtualInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  analogX: number; // -1 (full left) to 1 (full right)
  analogY: number; // -1 (full backward) to 1 (full forward)
  sprint: boolean;
  jump: boolean;
  attack: boolean;
  handbrake: boolean;
  boost: boolean;
  horn: boolean;
  camDeltaX: number;
  camDeltaY: number;
  recenterCamera: boolean;
}

export const virtualInput: VirtualInputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  analogX: 0,
  analogY: 0,
  sprint: false,
  jump: false,
  attack: false,
  handbrake: false,
  boost: false,
  horn: false,
  camDeltaX: 0,
  camDeltaY: 0,
  recenterCamera: false,
};

export const setVirtualInput = (partial: Partial<VirtualInputState>) => {
  Object.assign(virtualInput, partial);
};

export const resetVirtualInput = () => {
  virtualInput.forward = false;
  virtualInput.backward = false;
  virtualInput.left = false;
  virtualInput.right = false;
  virtualInput.analogX = 0;
  virtualInput.analogY = 0;
  virtualInput.sprint = false;
  virtualInput.jump = false;
  virtualInput.attack = false;
  virtualInput.handbrake = false;
  virtualInput.boost = false;
  virtualInput.horn = false;
  virtualInput.camDeltaX = 0;
  virtualInput.camDeltaY = 0;
  virtualInput.recenterCamera = false;
};

/**
 * Mobile Device Detection
 * Accurately detects touch phones, tablets, mobile browsers, and compact mobile landscape viewports.
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouchUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isShortHeight = window.innerHeight <= 550;
  const isNarrowWidth = window.innerWidth <= 1024;
  return isTouchUa || (hasTouch && (isNarrowWidth || isShortHeight)) || isShortHeight;
};

