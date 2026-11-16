import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext({
  success: () => {},
  error: () => {},
  info: () => {},
});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idCounter = useRef(0);

  const addToast = (type, message) => {
    const id = ++idCounter.current;
    setItems((prev) => {
      const next = [...prev, { id, type, message }];
      return next.slice(-3);
    });
  };

  const removeToast = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const success = (message) => addToast('success', message);
  const error = (message) => addToast('error', message);
  const info = (message) => addToast('info', message);

  useEffect(() => {
    const timeouts = new Map();
    items.forEach((item) => {
      const duration = item.type === 'error' ? 6000 : 4000;
      const timeout = setTimeout(() => {
        removeToast(item.id);
      }, duration);
      timeouts.set(item.id, timeout);
    });
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [items]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-24 lg:bottom-6 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.type === 'error' ? 'alert' : 'status'}
            className="glass flex items-start gap-3 p-3 fade-up"
          >
            {item.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {item.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {item.type === 'info' && (
              <Info className="w-5 h-5 text-water flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <p className="flex-1 text-sm text-ink">{item.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(item.id)}
              className="flex-shrink-0 text-muted hover:text-ink transition"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}