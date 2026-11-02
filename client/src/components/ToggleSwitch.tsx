interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}

export default function ToggleSwitch({ checked, onChange, label, disabled = false }: ToggleSwitchProps) {
    return <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-blue" : "bg-blue/20"}`}
    >
        <span className={`absolute top-1 size-5 rounded-full bg-light-blue shadow-sm transition-[left] ${checked ? "left-6" : "left-1"}`} />
    </button>;
}
