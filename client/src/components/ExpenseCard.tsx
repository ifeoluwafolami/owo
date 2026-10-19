import { useEffect, useRef, useState } from "react";

interface ExpenseCardProps {
    expenseName: string;
    amount: number;
    category: string;
    categoryBudget: number;
    replaySignal?: number;
    date?: string;
    className?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export default function ExpenseCard({
    expenseName,
    amount,
    category,
    categoryBudget,
    replaySignal = 0,
    date,
    className = "",
}: ExpenseCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [stage, setStage] = useState(0);
    const amountLeft = Math.max(categoryBudget - amount, 0);
    const remainingPercentage = (amountLeft / categoryBudget) * 100;

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        setStage(0);
        const timeouts: number[] = [];
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                timeouts.push(window.setTimeout(() => setStage(1), 250));
                timeouts.push(window.setTimeout(() => setStage(2), 1100));
                timeouts.push(window.setTimeout(() => setStage(3), 2000));
                observer.disconnect();
            },
            { threshold: 0.35 },
        );

        observer.observe(card);

        return () => {
            observer.disconnect();
            timeouts.forEach((timeout) => window.clearTimeout(timeout));
        };
    }, [replaySignal]);

    return (
        <div ref={cardRef} className={`w-full rounded-2xl bg-light-blue px-5 py-8 text-blue shadow-lg ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm tracking-widest uppercase text-blue font-black">{date ?? "New expense"}</p>
                <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${stage === 3 ? "bg-blue" : "bg-blue/20"}`}
                />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="rounded-xl border border-blue/15 bg-white/35 px-4 py-3">
                    <p className="text-xs uppercase opacity-50">Expense</p>
                    <p className={`mt-1 font-semibold transition-all duration-500 ${stage >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
                        {expenseName}
                    </p>
                </div>
                <div className="rounded-xl border border-blue/15 bg-white/35 px-4 py-3 text-right">
                    <p className="text-xs uppercase opacity-50">Amount</p>
                    <p className={`mt-1 font-semibold transition-all delay-150 duration-500 ${stage >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
                        {currencyFormatter.format(amount)}
                    </p>
                </div>
            </div>

            <div className="mt-3 rounded-xl border border-blue/15 bg-white/35 px-4 py-3">
                <p className="text-xs uppercase opacity-50">Budget category</p>
                <div className={`mt-2 transition-all duration-500 ${stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
                    <span className="font-semibold">{category}</span>
                </div>

                <div className={`mt-3 transition-opacity duration-500 ${stage >= 3 ? "opacity-100" : "opacity-0"}`}>
                    <div
                        className="h-2 overflow-hidden rounded-full bg-blue/15"
                        role="progressbar"
                        aria-label={`${category} budget remaining`}
                        aria-valuemin={0}
                        aria-valuemax={categoryBudget}
                        aria-valuenow={amountLeft}
                    >
                        <div
                            className="h-full rounded-full bg-blue transition-[width] duration-700 ease-out"
                            style={{ width: stage >= 3 ? `${remainingPercentage}%` : "100%" }}
                        />
                    </div>
                    <p className="mt-2 text-xs opacity-60">
                        {currencyFormatter.format(amountLeft)} left to spend
                    </p>
                </div>
            </div>
        </div>
    );
}
