'use client';

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default function Toast({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-[200] animate-slide-in-right">
      <div
        className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md backdrop-blur-sm animate-scale-in`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <p className="text-white flex-1 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Progress bar */}
        {duration > 0 && (
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                type === 'success'
                  ? 'bg-green-500'
                  : type === 'error'
                  ? 'bg-red-500'
                  : type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              } animate-progress`}
              style={{
                animation: `progress ${duration}ms linear`,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
