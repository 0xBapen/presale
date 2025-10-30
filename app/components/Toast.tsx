"use client";

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastIdCounter = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export const toast = {
  success: (message: string) => {
    const toast: Toast = {
      id: `toast-${++toastIdCounter}`,
      message,
      type: 'success',
    };
    toastListeners.forEach(listener => listener(toast));
  },
  error: (message: string) => {
    const toast: Toast = {
      id: `toast-${++toastIdCounter}`,
      message,
      type: 'error',
    };
    toastListeners.forEach(listener => listener(toast));
  },
  info: (message: string) => {
    const toast: Toast = {
      id: `toast-${++toastIdCounter}`,
      message,
      type: 'info',
    };
    toastListeners.forEach(listener => listener(toast));
  },
  warning: (message: string) => {
    const toast: Toast = {
      id: `toast-${++toastIdCounter}`,
      message,
      type: 'warning',
    };
    toastListeners.forEach(listener => listener(toast));
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);

    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-orange-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500',
    error: 'bg-red-500/10 border-red-500',
    warning: 'bg-orange-500/10 border-orange-500',
    info: 'bg-blue-500/10 border-blue-500',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${colors[toast.type]} backdrop-blur-lg shadow-lg min-w-[320px] max-w-md animate-slide-in`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-sm text-white">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-white transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

