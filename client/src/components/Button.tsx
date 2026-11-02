import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "light" | "dark";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    label: string;
    variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
    light: "border-blue/30 bg-light-blue text-blue hover:border-blue/60 hover:bg-light-blue/80 hover:text-blue/80",
    dark: "border-transparent bg-blue text-light-blue hover:bg-blue/80 hover:text-light-blue/80",
};

export default function Button({
    label,
    variant = "light",
    className = "",
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex h-12 items-center justify-center whitespace-nowrap rounded-2xl border px-6 font-space-grotesk text-xs tracking-widest leading-none uppercase transition-all duration-500 hover:scale-102 sm:px-8 sm:text-sm ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {label}
        </button>
    );
}
