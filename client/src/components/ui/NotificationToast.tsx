import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const notification = useGameStore((s) => s.notification);
  const dismiss = useGameStore((s) => s.dismissNotification);

  if (!notification) return null;

  const { title, message, type = 'info' } = notification;

  // Suppress useless routine notifications (rewards, daily income, vehicles, weapons, doors)
  const lowerTitle = title.toLowerCase();
  const lowerMsg = message.toLowerCase();
  if (
    lowerTitle.includes('reward') ||
    lowerTitle.includes('daily') ||
    lowerTitle.includes('vehicle') ||
    lowerTitle.includes('welcome') ||
    lowerTitle.includes('exited') ||
    lowerTitle.includes('weapon') ||
    lowerTitle.includes('tv') ||
    lowerTitle.includes('refrigerator') ||
    lowerTitle.includes('wardrobe') ||
    lowerTitle.includes('rest') ||
    lowerMsg.includes('income') ||
    lowerMsg.includes('behind the wheel')
  ) {
    return null;
  }

  let borderColor = 'border-cyan-400/50';
  let icon = <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  if (type === 'success') {
    borderColor = 'border-emerald-400/50';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  } else if (type === 'warning') {
    borderColor = 'border-amber-400/50';
    icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border ${borderColor} shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-2 max-w-[92vw] sm:max-w-md pointer-events-auto`}
      >
        {icon}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs truncate">
          <span className="font-black text-white">{title}:</span>
          <span className="text-gray-300 font-medium truncate">{message}</span>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-400 hover:text-white ml-1 p-0.5 active:scale-90 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
