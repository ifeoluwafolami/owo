interface BudgetCategoryCardProps {
    name: string;
    spent: number;
    budget: number;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export default function BudgetCategoryCard({ name, spent, budget }: BudgetCategoryCardProps) {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const progressWidth = Math.min(percentage, 100);
    const remaining = Math.max(budget - spent, 0);
    const isOverBudget = spent > budget;

    return (
        <article className="w-full rounded-xl border border-blue/15 bg-light-blue px-4 py-3 text-blue shadow-lg">
            <p className="text-xs uppercase opacity-50">Budget category</p>
            <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-semibold">{name}</span>
                <span className={`text-xs font-semibold ${isOverBudget ? "text-red-700" : "text-blue/60"}`}>
                    {currencyFormatter.format(spent)} / {currencyFormatter.format(budget)}
                </span>
            </div>

            <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-blue/15"
                role="progressbar"
                aria-label={`${name} budget spent`}
                aria-valuemin={0}
                aria-valuemax={budget}
                aria-valuenow={spent}
            >
                <div
                    className={`h-full rounded-full ${isOverBudget ? "bg-red-500" : "bg-blue"}`}
                    style={{ width: `${progressWidth}%` }}
                />
            </div>
            <p className={`mt-2 text-xs ${isOverBudget ? "font-semibold text-red-700" : "opacity-60"}`}>
                {isOverBudget
                    ? `${currencyFormatter.format(spent - budget)} over budget`
                    : `${currencyFormatter.format(remaining)} left to spend`}
            </p>
        </article>
    );
}
