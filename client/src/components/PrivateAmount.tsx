import { Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "../privacy";

interface PrivateAmountProps {
    value: string;
    className?: string;
}

export default function PrivateAmount({ value, className = "" }: PrivateAmountProps) {
    const { amountsVisible, toggleAmounts } = usePrivacy();

    return <button
        type="button"
        onClick={toggleAmounts}
        aria-label={amountsVisible ? "Hide all amounts" : "Reveal all amounts"}
        aria-pressed={amountsVisible}
        className={`inline-flex max-w-full items-center gap-2 rounded-md text-left outline-none transition hover:opacity-75 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${className}`}
        title={amountsVisible ? "Hide all amounts" : "Reveal all amounts"}
    >
        <span className="min-w-0 break-words">{amountsVisible ? value : "••••••"}</span>
        {amountsVisible ? <EyeOff className="size-[0.8em] shrink-0 opacity-45" aria-hidden="true" /> : <Eye className="size-[0.8em] shrink-0 opacity-45" aria-hidden="true" />}
    </button>;
}
