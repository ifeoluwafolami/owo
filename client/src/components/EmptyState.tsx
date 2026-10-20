import type { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = "",
}: EmptyStateProps) {
    return (
        <div className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-blue/25 bg-light-blue px-6 py-12 text-center text-blue ${className}`}>
            <span className="grid size-14 place-items-center rounded-2xl bg-blue/10">
                <Icon className="size-7" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-ferrite text-lg uppercase tracking-wide">{title}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-blue/60">{description}</p>
            {actionLabel && onAction && (
                <Button label={actionLabel} variant="dark" onClick={onAction} className="mt-6" />
            )}
        </div>
    );
}
