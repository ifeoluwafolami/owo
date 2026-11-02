import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
    label?: string;
    className?: string;
}

export default function LoadingState({ label = "Loading your data…", className = "" }: LoadingStateProps) {
    return <div className={`flex min-h-64 w-full flex-col items-center justify-center rounded-2xl bg-blue/20 px-4 py-12 text-center text-light-blue ${className}`} role="status" aria-live="polite">
        <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
        <p className="mt-3 font-ferrite text-sm uppercase tracking-widest">{label}</p>
    </div>;
}
