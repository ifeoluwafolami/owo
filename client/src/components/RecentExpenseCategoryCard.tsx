import type { ActiveBudgetCategory } from "../finance";
import { currencyFormatter } from "../finance";
import PrivateAmount from "./PrivateAmount";

interface RecentExpenseCategoryCardProps {
    activity: ActiveBudgetCategory;
}

export default function RecentExpenseCategoryCard({ activity }: RecentExpenseCategoryCardProps) {
    const { category, spent, lastExpense } = activity;
    const remaining = Math.max(category.monthlyLimit - spent, 0);
    const spentPercentage = category.monthlyLimit > 0
        ? Math.min((spent / category.monthlyLimit) * 100, 100)
        : 100;

    return <article className="min-w-0 rounded-2xl bg-light-blue p-4 text-blue shadow-lg sm:p-5">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-blue/50">Budget category</p>
                <h3 className="mt-1 truncate text-lg font-semibold sm:text-xl">{category.name}</h3>
            </div>
            <p className="shrink-0 rounded-full bg-blue px-3 py-1 text-xs font-semibold text-light-blue">
                {spentPercentage.toFixed(0)}% spent
            </p>
        </div>

        <div className="mt-4">
            <div
                className="h-2.5 overflow-hidden rounded-full bg-blue/15"
                role="progressbar"
                aria-label={`${category.name} budget spent`}
                aria-valuemin={0}
                aria-valuemax={category.monthlyLimit}
                aria-valuenow={Math.min(spent, category.monthlyLimit)}
            >
                <div className="h-full rounded-full bg-blue" style={{ width: `${spentPercentage}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-blue/60">
                <PrivateAmount value={`${currencyFormatter.format(spent)} spent`} />
                <PrivateAmount value={`${currencyFormatter.format(remaining)} left`} />
            </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue/15 bg-white/35 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-blue/50">Latest expense</p>
                    <p className="mt-1 truncate font-semibold">{lastExpense.name}</p>
                </div>
                <div className="shrink-0 text-right">
                    <PrivateAmount value={currencyFormatter.format(lastExpense.amount)} className="font-semibold" />
                    <p className="mt-1 text-xs text-blue/50">{new Date(lastExpense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                </div>
            </div>
            <p className="mt-3 border-t border-blue/10 pt-3 text-sm leading-relaxed text-blue/65">
                {lastExpense.note || "No note was added for this expense."}
            </p>
        </div>
    </article>;
}
