import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const notification = useGameStore((s) => s.notification);
  const dismiss = useGameStore((s) => s.dismissNotification);

  if (!notification) return null;

  const { title, message, type = 'info' } = notification;

  let borderColor = 'border-cyan-500/50';
  let icon = <Info className="w-5 h-5 text-cyan-400" />;
  if (type === 'success') {
    borderColor = 'border-emerald-500/50';
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  } else if (type === 'warning') {
    borderColor = 'border-amber-500/50';
    icon = <AlertCircle className="w-5 h-5 text-amber-400" />;
  }

  return (
    <div className="fixed top-20 right-8 z-50 select-none animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className={`p-4 rounded-2xl glass-panel border ${borderColor} shadow-2xl flex items-start gap-3 max-w-sm backdrop-blur-xl`}>
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-white">{title}</h4>
          <p className="text-xs text-neutral-300 mt-0.5 leading-snug">{message}</p>
        </div>
        <button onClick={dismiss} className="text-neutral-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

