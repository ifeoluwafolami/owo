import type { InputHTMLAttributes } from "react";

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "inputMode"> {
    value: string;
    onValueChange: (value: string) => void;
}

const numberFormatter = new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
});

export default function MoneyInput({ value, onValueChange, className = "", ...props }: MoneyInputProps) {
    const displayValue = value ? numberFormatter.format(Number(value)) : "";

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-semibold text-blue/55">
                ₦
            </span>
            <input
                {...props}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/\D/g, "");
                    const normalizedValue = digitsOnly.replace(/^0+(?=\d)/, "");
                    onValueChange(normalizedValue);
                }}
                className={`h-12 w-full rounded-xl border border-blue/20 bg-white/40 pl-10 pr-4 text-blue outline-none transition placeholder:text-blue/40 focus:border-blue focus:ring-2 focus:ring-blue/15 ${className}`}
            />
        </div>
    );
}
