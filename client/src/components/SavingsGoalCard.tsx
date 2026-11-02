import { useEffect, useRef, useState } from "react";
import PrivateAmount from "./PrivateAmount";

interface SavingsGoalCardProps {
    title: string;
    targetAmount: number;
    savedAmount: number;
    targetDate?: string;
    className?: string;
    animate?: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export default function SavingsGoalCard({
    title,
    targetAmount,
    savedAmount,
    targetDate,
    className = "",
    animate = true,
}: SavingsGoalCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(!animate);
    const progress = Math.min((savedAmount / targetAmount) * 100, 100);
    const showProgress = !animate || isVisible;

    useEffect(() => {
        if (!animate) return;

        const card = cardRef.current;
        if (!card) return;

        let animationFrame = 0;
        const observer = new IntersectionObserver(
            ([entry]) => {
                window.cancelAnimationFrame(animationFrame);

                if (entry.isIntersecting) {
                    animationFrame = window.requestAnimationFrame(() => setIsVisible(true));
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: 0.35 },
        );

        observer.observe(card);

        return () => {
            observer.disconnect();
            window.cancelAnimationFrame(animationFrame);
        };
    }, [animate]);

    return (
        <div
            ref={cardRef}
            className={`min-w-0 w-full rounded-2xl bg-light-blue p-4 text-blue shadow-lg sm:p-6 ${className}`}
        >
            <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8 sm:gap-4">
                <div className="min-w-0">
                    {/* <p className="mb-2 text-sm tracking-widest uppercase opacity-70">Savings target</p> */}
                    <h4 className="break-words text-xl font-semibold capitalize tracking-wide sm:text-2xl">{title}</h4>
                    {targetDate && (
                        <p className="mt-1 text-sm text-blue/60 uppercase">
                            {new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(targetDate))}
                        </p>
                    )}
                </div>
                <span className="rounded-full bg-blue px-3 py-1 text-sm font-semibold text-light-blue">
                    {progress.toFixed(0)}%
                </span>
            </div>

            <div
                className="h-4 overflow-hidden rounded-full bg-blue/15"
                role="progressbar"
                aria-label={`${title} savings progress`}
                aria-valuemin={0}
                aria-valuemax={targetAmount}
                aria-valuenow={savedAmount}
            >
                <div
                    className={`h-full rounded-full bg-blue ${animate && isVisible ? "transition-[width] duration-[1600ms] ease-out" : "transition-none"}`}
                    style={{ width: showProgress ? `${progress}%` : "0%" }}
                />
            </div>

            <div className="mt-4 flex justify-between gap-4 text-sm">
                <div>
                    <p className="opacity-60">Saved</p>
                    <PrivateAmount value={currencyFormatter.format(savedAmount)} className="text-base font-semibold tracking-wide sm:text-lg sm:tracking-wider" />
                </div>
                <div className="text-right">
                    <p className="opacity-60">Target</p>
                    <PrivateAmount value={currencyFormatter.format(targetAmount)} className="text-base font-semibold tracking-wide sm:text-lg sm:tracking-wider" />
                </div>
            </div>
        </div>
    );
}
