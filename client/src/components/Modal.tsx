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
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousActiveElement?.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-1000 flex items-center justify-center bg-blue/60 backdrop-blur-sm ${mobileFullScreen ? "p-0 sm:p-4" : "p-4"}`}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`relative w-full overflow-y-auto bg-light-blue p-7 text-blue shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${size === "large" ? "max-w-3xl" : "max-w-lg"} ${mobileFullScreen ? "h-dvh max-h-dvh rounded-none sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:rounded-3xl" : "max-h-[calc(100vh-2rem)] rounded-3xl"}`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-blue/10 text-xl leading-none transition hover:bg-blue hover:text-light-blue"
                >
                    ×
                </button>
                <h2 id={titleId} className="pr-12 font-ferrite text-xl font-medium uppercase tracking-wide">
                    {title}
                </h2>
                <div className="mt-8">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
