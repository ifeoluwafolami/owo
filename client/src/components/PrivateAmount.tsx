import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { usePrivacy } from "../privacy";

interface PrivateAmountProps {
    value: string;
    className?: string;
}

export default function PrivateAmount({ value, className = "" }: PrivateAmountProps) {
    const { amountsVisible, privacyVersion } = usePrivacy();
    const [visibilityOverride, setVisibilityOverride] = useState<{ version: number; visible: boolean } | null>(null);
    const activeOverride = visibilityOverride?.version === privacyVersion ? visibilityOverride.visible : null;
    const isVisible = activeOverride ?? amountsVisible;

    const toggleThisAmount = () => {
        setVisibilityOverride({ version: privacyVersion, visible: !isVisible });
    };

    return <button
        type="button"
        onClick={toggleThisAmount}
        aria-label={isVisible ? "Hide this amount" : "Reveal this amount"}
        aria-pressed={isVisible}
        className={`inline-flex max-w-full items-center gap-2 rounded-md text-left outline-none transition hover:opacity-75 focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 ${className}`}
        title={isVisible ? "Hide this amount" : "Reveal this amount"}
    >
        <span className="min-w-0 break-words">{isVisible ? value : "••••••"}</span>
        {isVisible ? <EyeOff className="size-[0.8em] shrink-0 opacity-45" aria-hidden="true" /> : <Eye className="size-[0.8em] shrink-0 opacity-45" aria-hidden="true" />}
    </button>;
}
