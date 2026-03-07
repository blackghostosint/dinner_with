import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({
  addToast: () => {},
});

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message) => {
    const id = nextId += 1;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const contextValue = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-32 flex justify-center gap-3 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="min-w-[220px] max-w-md rounded-2xl border border-amber-100 bg-white/95 px-5 py-3 text-center text-sm font-semibold text-slate-700 shadow-lg backdrop-blur"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
