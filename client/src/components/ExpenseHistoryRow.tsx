import { Menu, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Expense } from "../finance";
import { currencyFormatter } from "../finance";
import PrivateAmount from "./PrivateAmount";

interface ExpenseHistoryRowProps {
    expense: Expense;
    onEdit: () => void;
    onDelete: () => void;
    horizontalPadding?: "compact" | "regular";
}

export default function ExpenseHistoryRow({ expense, onEdit, onDelete, horizontalPadding = "regular" }: ExpenseHistoryRowProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const padding = horizontalPadding === "compact" ? "px-3 sm:px-4" : "px-4 sm:px-5";
    const date = new Date(expense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" });

    const edit = () => {
        setMenuOpen(false);
        onEdit();
    };
    const remove = () => {
        setMenuOpen(false);
        onDelete();
    };

    return <div className={`relative grid grid-cols-[minmax(0,1fr)_auto] items-stretch gap-3 border-b border-blue/10 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(7rem,0.7fr)_minmax(8rem,0.8fr)_4.5rem] sm:items-center sm:gap-4 ${padding}`}>
        <div className="min-w-0">
            <p className="truncate font-semibold">{expense.name}</p>
            <p className="mt-1 hidden text-xs text-blue/55 sm:block">{date}</p>
            <div className="mt-2 space-y-1.5 sm:hidden">
                {expense.note && <p className="text-sm leading-relaxed text-blue/65">{expense.note}</p>}
                <p className="text-sm font-medium text-blue/75">{expense.category.name}</p>
                <p className="text-xs text-blue/55">{date}</p>
            </div>
        </div>

        <p className="hidden min-w-0 line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-blue/65 sm:block">{expense.note || "—"}</p>
        <p className="hidden min-w-0 truncate text-sm text-blue/65 sm:block">{expense.category.name}</p>
        <div className="hidden justify-self-end sm:block">
            <PrivateAmount value={currencyFormatter.format(expense.amount)} className="whitespace-nowrap text-sm font-bold tracking-wide sm:text-base" />
        </div>
        <div className="hidden items-center justify-end gap-1.5 sm:flex">
            <button type="button" onClick={edit} className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue/15 transition hover:bg-blue hover:text-light-blue" aria-label={`Edit ${expense.name}`}><Pencil className="size-4" /></button>
            <button type="button" onClick={remove} className="grid size-8 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-100" aria-label={`Delete ${expense.name}`}><Trash2 className="size-4" /></button>
        </div>

        <div className="relative flex min-w-24 flex-col items-end justify-between sm:hidden">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={`Actions for ${expense.name}`} aria-expanded={menuOpen} className="grid size-8 place-items-center rounded-lg transition hover:bg-blue/10">
                <Menu className="size-5" />
            </button>
            {menuOpen && <div className="absolute right-0 top-9 z-30 w-36 rounded-xl border border-blue/10 bg-light-blue p-1.5 shadow-xl">
                <button type="button" onClick={edit} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-blue/10"><Pencil className="size-4" />Edit</button>
                <button type="button" onClick={remove} className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="size-4" />Delete</button>
            </div>}
            <PrivateAmount value={currencyFormatter.format(expense.amount)} className="whitespace-nowrap text-sm font-bold tracking-wide" />
        </div>
    </div>;
}
