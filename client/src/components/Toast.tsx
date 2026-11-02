import { CheckCircle2, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error";

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    success(message: string): void;
    error(message: string): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((items) => items.filter((item) => item.id !== id));
    }, []);

    const show = useCallback((message: string, type: ToastType) => {
        const id = ++nextToastId;
        setToasts((items) => [...items, { id, message, type }]);
        window.setTimeout(() => dismiss(id), type === "error" ? 7000 : 4500);
    }, [dismiss]);

    const value = useMemo<ToastContextValue>(() => ({
        success: (message) => show(message, "success"),
        error: (message) => show(message, "error"),
    }), [show]);

    const toastViewport = <div className="pointer-events-none fixed right-4 top-4 z-[2000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite" aria-atomic="false">
            {toasts.map((toast) => {
                const Icon = toast.type === "success" ? CheckCircle2 : XCircle;
                return <div
                    key={toast.id}
                    role={toast.type === "error" ? "alert" : "status"}
                    className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur ${toast.type === "success" ? "border-green-200 bg-green-50/95 text-green-900" : "border-red-200 bg-red-50/95 text-red-900"}`}
                >
                    <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <p className="min-w-0 flex-1 whitespace-pre-line text-sm font-medium leading-relaxed">{toast.message}</p>
                    <button type="button" onClick={() => dismiss(toast.id)} className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-black/5" aria-label="Dismiss notification">
                        <X className="size-4" />
                    </button>
                </div>;
            })}
        </div>;

    return <ToastContext.Provider value={value}>
        {children}
        {createPortal(toastViewport, document.body)}
    </ToastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
