import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "light" | "dark";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    label: string;
    variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
    light: "bg-light-blue text-blue hover:bg-light-blue/80 hover:text-blue/80",
    dark: "bg-blue text-light-blue hover:bg-blue/80 hover:text-light-blue/80",
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
            className={`inline-flex h-12 items-center justify-center rounded-2xl px-8 font-space-grotesk tracking-widest leading-none uppercase transition-all duration-500 hover:scale-102 ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {label}
        </button>
    );
}
