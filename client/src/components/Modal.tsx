import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: "default" | "large";
    mobileFullScreen?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, size = "default", mobileFullScreen = false }: ModalProps) {
    const titleId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const previousActiveElement = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const focusFrame = window.requestAnimationFrame(() => {
            dialogRef.current
                ?.querySelector<HTMLElement>("input, button, [href], select, textarea, [tabindex]:not([tabindex='-1'])")
                ?.focus();
        });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCloseRef.current();
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousActiveElement?.focus();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-1000 flex items-center justify-center bg-blue/60 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`relative w-full overflow-y-auto rounded-2xl bg-light-blue p-5 text-sm text-blue shadow-2xl [scrollbar-width:none] sm:rounded-3xl sm:p-7 sm:text-base ${size === "large" ? "max-w-4xl" : "max-w-2xl"} ${mobileFullScreen ? "h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] sm:h-auto sm:max-h-[calc(100vh-2.5rem)]" : "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)]"}`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-blue/10 text-lg leading-none transition hover:bg-blue hover:text-light-blue sm:right-5 sm:top-5 sm:h-9 sm:w-9 sm:text-xl"
                >
                    ×
                </button>
                <h2 id={titleId} className="pr-10 font-ferrite text-base font-medium uppercase tracking-wide sm:pr-12 sm:text-xl">
                    {title}
                </h2>
                <div className="mt-5 sm:mt-8">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
