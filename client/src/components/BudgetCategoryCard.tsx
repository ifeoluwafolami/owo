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
        <article className="rounded-2xl bg-light-blue p-5 text-blue shadow-lg">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-ferrite text-sm font-medium uppercase tracking-wider">{name}</p>
                    <p className="mt-3 text-2xl font-bold tracking-wider">{currencyFormatter.format(spent)}</p>
                    <p className="mt-1 text-sm text-blue/60">spent of {currencyFormatter.format(budget)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isOverBudget ? "bg-red-200 text-red-800" : "bg-blue text-light-blue"}`}>
                    {percentage.toFixed(0)}%
                </span>
            </div>

            <div
                className="mt-5 h-3 overflow-hidden rounded-full bg-blue/15"
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

            <p className={`mt-3 text-sm ${isOverBudget ? "font-semibold text-red-700" : "text-blue/60"}`}>
                {isOverBudget
                    ? `${currencyFormatter.format(spent - budget)} over budget`
                    : `${currencyFormatter.format(remaining)} remaining`}
            </p>
        </article>
    );
}
