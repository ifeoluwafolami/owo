import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface OverviewCardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    supportingText: string;
    animate?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export default function OverviewCard({
    title,
    amount,
    icon: Icon,
    supportingText,
    animate = true,
}: OverviewCardProps) {
    const cardRef = useRef<HTMLElement>(null);
    const [displayAmount, setDisplayAmount] = useState(animate ? 0 : amount);

    useEffect(() => {
        if (!animate) return;

        const card = cardRef.current;
        if (!card) return;

        let animationFrame = 0;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    setDisplayAmount(amount);
                    observer.disconnect();
                    return;
                }

                const duration = 1400;
                const startTime = performance.now();

                const animateAmount = (currentTime: number) => {
                    const elapsed = Math.min((currentTime - startTime) / duration, 1);
                    const easedProgress = 1 - Math.pow(1 - elapsed, 3);
                    setDisplayAmount(Math.round(amount * easedProgress));

                    if (elapsed < 1) {
                        animationFrame = window.requestAnimationFrame(animateAmount);
                    } else {
                        setDisplayAmount(amount);
                    }
                };

                animationFrame = window.requestAnimationFrame(animateAmount);
                observer.disconnect();
            },
            { threshold: 0.35 },
        );

        observer.observe(card);
        return () => {
            observer.disconnect();
            window.cancelAnimationFrame(animationFrame);
        };
    }, [amount, animate]);

    return (
        <article ref={cardRef} className={`group flex min-h-44 flex-col justify-between rounded-2xl bg-light-blue p-6 text-blue shadow-lg ${animate ? "transition duration-300 hover:-translate-y-1 hover:shadow-2xl" : ""}`}>
            <div className="flex items-center justify-between gap-4">
                <h2 className="font-ferrite text-sm font-medium uppercase tracking-wider">{title}</h2>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-blue text-light-blue ${animate ? "transition-transform duration-300 group-hover:scale-105" : ""}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>

            <div>
                <p className="text-3xl font-bold tracking-wider">{currencyFormatter.format(animate ? displayAmount : amount)}</p>
                <p className="mt-2 text-sm text-blue/60">{supportingText}</p>
            </div>
        </article>
    );
}
