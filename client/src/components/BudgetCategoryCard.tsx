import { Pencil, Trash2 } from "lucide-react";
import PrivateAmount from "./PrivateAmount";

interface BudgetCategoryCardProps {
    name: string;
    spent: number;
    budget: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export default function BudgetCategoryCard({ name, spent, budget, onEdit, onDelete }: BudgetCategoryCardProps) {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const progressWidth = Math.min(percentage, 100);
    const remaining = Math.max(budget - spent, 0);
    const isOverBudget = spent > budget;

    return (
        <article className="w-full rounded-xl border border-blue/15 bg-light-blue px-4 py-3 text-blue shadow-lg">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase opacity-50">Budget category</p>
                {(onEdit || onDelete) && <div className="flex items-center gap-1">
                    {onEdit && <button type="button" onClick={onEdit} className="grid size-8 place-items-center rounded-lg border border-blue/15 transition hover:bg-blue hover:text-light-blue" aria-label={`Edit ${name}`} title="Edit category"><Pencil className="size-4" /></button>}
                    {onDelete && <button type="button" onClick={onDelete} className="grid size-8 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-100" aria-label={`Delete ${name}`} title="Delete category"><Trash2 className="size-4" /></button>}
                </div>}
            </div>
            <div className="mt-2 flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="font-semibold">{name}</span>
                <PrivateAmount value={`${currencyFormatter.format(spent)} / ${currencyFormatter.format(budget)}`} className={`text-xs font-semibold ${isOverBudget ? "text-red-700" : "text-blue/60"}`} />
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
            <PrivateAmount
                value={isOverBudget ? `${currencyFormatter.format(spent - budget)} over budget` : `${currencyFormatter.format(remaining)} left to spend`}
                className={`mt-2 text-xs ${isOverBudget ? "font-semibold text-red-700" : "opacity-60"}`}
            />
        </article>
    );
}
