import { CircleDollarSign, History, Pencil, Plus, ReceiptText, Trash2, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import Button from "../components/Button";
import BudgetCategoryCard from "../components/BudgetCategoryCard";
import CalendarInput from "../components/CalendarInput";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";
import MoneyInput from "../components/MoneyInput";
import OverviewCard from "../components/OverviewCard";
import PrivateAmount from "../components/PrivateAmount";
import { useToast } from "../components/Toast";
import { useAuth, type CurrentUser } from "../auth";
import type { BudgetCategory, Expense } from "../finance";
import { currencyFormatter, localDateValue } from "../finance";

interface Income { _id: string; source: string; amount: number; receivedAt: string }

export default function Spending() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState<"expense" | "edit-expense" | "delete-expense" | "income" | "category" | "edit-category" | "delete-category" | "history" | "monthly-income" | null>(searchParams.get("action") === "add-expense" ? "expense" : null);
    const [expenseDraft, setExpenseDraft] = useState({ name: "", amount: "", categoryId: "", occurredAt: localDateValue(), note: "" });
    const [editExpenseDraft, setEditExpenseDraft] = useState({ name: "", amount: "", categoryId: "", occurredAt: localDateValue(), note: "" });
    const [incomeDraft, setIncomeDraft] = useState({ source: "", amount: "", receivedAt: localDateValue() });
    const [categoryDraft, setCategoryDraft] = useState({ name: "", monthlyLimit: "" });
    const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [monthlyIncomeDraft, setMonthlyIncomeDraft] = useState(String(user?.monthlyIncome ?? ""));

    useEffect(() => {
        void Promise.all([
            api<{ categories: BudgetCategory[] }>("/budgets"),
            api<{ expenses: Expense[] }>("/expenses?limit=100"),
            api<{ income: Income[] }>("/income?limit=100"),
        ]).then(([budgetResult, expenseResult, incomeResult]) => {
            setCategories(budgetResult.categories);
            setExpenses(expenseResult.expenses);
            setIncome(incomeResult.income);
        }).catch((reason: Error) => toast.error(reason.message))
            .finally(() => setIsLoading(false));
    }, [toast]);

    const totals = useMemo(() => {
        const totalBudget = categories.reduce((sum, item) => sum + item.monthlyLimit, 0);
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        return { totalBudget, totalSpent, totalIncome, remaining: Math.max(0, totalBudget - totalSpent) };
    }, [categories, expenses, income]);

    const submitExpense = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ expense: Expense }>("/expenses", { method: "POST", body: JSON.stringify({ ...expenseDraft, amount: Number(expenseDraft.amount) }) });
            setExpenses((items) => [result.expense, ...items]);
            setExpenseDraft({ name: "", amount: "", categoryId: "", occurredAt: localDateValue(), note: "" });
            setModal(null);
            toast.success("Expense recorded.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to save expense."); }
    };

    const submitIncome = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ income: Income }>("/income", { method: "POST", body: JSON.stringify({ ...incomeDraft, amount: Number(incomeDraft.amount) }) });
            setIncome((items) => [result.income, ...items]);
            setIncomeDraft({ source: "", amount: "", receivedAt: localDateValue() });
            setModal(null);
            toast.success("Income recorded.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to save income."); }
    };

    const openEditExpense = (expense: Expense) => {
        setSelectedExpense(expense);
        setEditExpenseDraft({
            name: expense.name,
            amount: String(expense.amount),
            categoryId: expense.category._id,
            occurredAt: expense.occurredAt.slice(0, 10),
            note: expense.note ?? "",
        });
        setModal("edit-expense");
    };

    const openDeleteExpense = (expense: Expense) => {
        setSelectedExpense(expense);
        setModal("delete-expense");
    };

    const updateExpense = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedExpense) return;
        try {
            const categoryChanged = editExpenseDraft.categoryId !== selectedExpense.category._id;
            const result = await api<{ expense: Expense }>(`/expenses/${selectedExpense._id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editExpenseDraft.name,
                    amount: Number(editExpenseDraft.amount),
                    occurredAt: editExpenseDraft.occurredAt,
                    note: editExpenseDraft.note,
                    ...(categoryChanged ? { categoryId: editExpenseDraft.categoryId } : {}),
                }),
            });
            setExpenses((items) => items.map((expense) => expense._id === result.expense._id ? result.expense : expense));
            setSelectedExpense(null);
            setModal(null);
            toast.success("Expense updated.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to update expense."); }
    };

    const deleteExpense = async () => {
        if (!selectedExpense) return;
        try {
            await api(`/expenses/${selectedExpense._id}`, { method: "DELETE" });
            setExpenses((items) => items.filter((expense) => expense._id !== selectedExpense._id));
            setSelectedExpense(null);
            setModal(null);
            toast.success("Expense deleted.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to delete expense."); }
    };

    const submitCategory = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ category: BudgetCategory }>("/budgets", { method: "POST", body: JSON.stringify({ name: categoryDraft.name, monthlyLimit: Number(categoryDraft.monthlyLimit) }) });
            setCategories((items) => [...items, result.category]);
            setCategoryDraft({ name: "", monthlyLimit: "" });
            setModal(null);
            toast.success("Budget category created.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to save category."); }
    };

    const openEditCategory = (category: BudgetCategory) => {
        setSelectedCategory(category);
        setCategoryDraft({ name: category.name, monthlyLimit: String(category.monthlyLimit) });
        setModal("edit-category");
    };

    const openDeleteCategory = (category: BudgetCategory) => {
        setSelectedCategory(category);
        setModal("delete-category");
    };

    const updateCategory = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedCategory) return;
        try {
            const result = await api<{ category: BudgetCategory }>(`/budgets/${selectedCategory._id}`, {
                method: "PATCH",
                body: JSON.stringify({ name: categoryDraft.name, monthlyLimit: Number(categoryDraft.monthlyLimit) }),
            });
            setCategories((items) => items.map((category) => category._id === result.category._id ? result.category : category));
            setSelectedCategory(null);
            setCategoryDraft({ name: "", monthlyLimit: "" });
            setModal(null);
            toast.success("Budget category updated.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to update category."); }
    };

    const deleteCategory = async () => {
        if (!selectedCategory) return;
        try {
            await api(`/budgets/${selectedCategory._id}`, { method: "DELETE" });
            const remainingCategories = categories.filter((category) => category._id !== selectedCategory._id);
            setCategories(remainingCategories);
            setExpenseDraft((draft) => ({
                ...draft,
                categoryId: draft.categoryId === selectedCategory._id ? "" : draft.categoryId,
            }));
            setSelectedCategory(null);
            setModal(null);
            toast.success("Budget category deleted.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to delete category."); }
    };

    const saveMonthlyIncome = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ user: CurrentUser }>("/users/me", {
                method: "PATCH",
                body: JSON.stringify({ monthlyIncome: Number(monthlyIncomeDraft || 0) }),
            });
            updateUser(result.user);
            setModal(null);
            toast.success("Monthly income updated.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to update monthly income."); }
    };

    return <Layout showHeader><main className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ferrite text-xs uppercase">Plan it. Track it.</p><h1 className="mt-2 text-2xl sm:text-3xl">Spending</h1></div><div className="grid grid-cols-2 gap-3 sm:flex"><Button label="Add Income" className="w-full sm:w-auto" onClick={() => setModal("income")} /><Button label="Log Expense" className="w-full sm:w-auto" onClick={() => setModal("expense")} /></div></div>
        {isLoading ? <LoadingState label="Loading your spending…" className="mt-6" /> : <><section className="mt-6 flex flex-col gap-4 rounded-2xl bg-light-blue p-4 text-blue shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div><p className="font-ferrite text-xs uppercase tracking-widest text-blue/55">Monthly income</p><PrivateAmount value={currencyFormatter.format(user?.monthlyIncome ?? 0)} className="mt-2 text-2xl font-bold sm:text-3xl" /><p className="mt-1 text-sm text-blue/60">Your regular income used for monthly planning.</p></div>
            <Button label={user?.monthlyIncome == null ? "Set Monthly Income" : "Edit Monthly Income"} variant="dark" className="w-full shrink-0 sm:w-auto" onClick={() => { setMonthlyIncomeDraft(String(user?.monthlyIncome ?? "")); setModal("monthly-income"); }} />
        </section><div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <OverviewCard title="Extra Income" amount={totals.totalIncome} icon={CircleDollarSign} supportingText="Cash inflow besides monthly income" />
            <OverviewCard title="Monthly budget" amount={totals.totalBudget} icon={WalletCards} supportingText="Total across your categories" />
            <OverviewCard title="Total spent" amount={totals.totalSpent} icon={ReceiptText} supportingText="All recorded expenses" />
            <OverviewCard title="Budget remaining" amount={totals.remaining} icon={WalletCards} supportingText="Available to spend" />
        </div>
        <section className="mt-8 sm:mt-10"><div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl sm:text-2xl">Budget categories</h2><Button label="Add Category" className="w-full sm:w-auto" onClick={() => setModal("category")} /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => {
            const spent = expenses.filter((expense) => expense.category._id === category._id).reduce((sum, expense) => sum + expense.amount, 0);
            return <BudgetCategoryCard key={category._id} name={category.name} spent={spent} budget={category.monthlyLimit} onEdit={() => openEditCategory(category)} onDelete={() => openDeleteCategory(category)} />;
        })}{!categories.length && <EmptyState icon={Plus} title="No budget categories" description="Create a category before recording an expense." actionLabel="Add Category" onAction={() => setModal("category")} className="md:col-span-2" />}</div></section>
        <section className="mt-8 sm:mt-10">
            <div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl sm:text-2xl">Expense history</h2>
                <Button label="View More" className="w-full sm:w-auto" onClick={() => setModal("history")} disabled={!expenses.length} />
            </div>
            <div className="overflow-hidden rounded-2xl bg-light-blue text-blue shadow-lg">
                {expenses.length > 0 && <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(7rem,0.7fr)_minmax(8rem,0.8fr)_4.5rem] gap-4 border-b border-blue/10 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-blue/45 sm:grid"><span>Expense</span><span>Note</span><span>Category</span><span className="text-right">Amount</span><span className="text-center">Actions</span></div>}
                {expenses.length ? expenses.slice(0, 5).map((expense) => (
                    <div key={expense._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-blue/10 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(7rem,0.7fr)_minmax(8rem,0.8fr)_4.5rem] sm:gap-4 sm:px-5">
                        <div className="min-w-0">
                            <p className="truncate font-semibold">{expense.name}</p>
                            <p className="mt-1 text-xs text-blue/55">{new Date(expense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                        </div>
                        <p className="hidden min-w-0 line-clamp-2 text-sm leading-relaxed text-blue/65 sm:block">{expense.note || "—"}</p>
                        <p className="hidden text-sm text-blue/65 sm:block">{expense.category.name}</p>
                        <PrivateAmount value={currencyFormatter.format(expense.amount)} className="hidden justify-self-end whitespace-nowrap text-sm font-bold tracking-wide sm:inline-flex sm:text-base" />
                        <div className="hidden items-center justify-end gap-1.5 sm:flex">
                            <button type="button" onClick={() => openEditExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue/15 transition hover:bg-blue hover:text-light-blue" aria-label={`Edit ${expense.name}`}><Pencil className="size-4" /></button>
                            <button type="button" onClick={() => openDeleteExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-100" aria-label={`Delete ${expense.name}`}><Trash2 className="size-4" /></button>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 sm:hidden">
                            <PrivateAmount value={currencyFormatter.format(expense.amount)} className="mr-1 whitespace-nowrap text-sm font-bold tracking-wide" />
                            <button type="button" onClick={() => openEditExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue/15 transition hover:bg-blue hover:text-light-blue" aria-label={`Edit ${expense.name}`}><Pencil className="size-4" /></button>
                            <button type="button" onClick={() => openDeleteExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-100" aria-label={`Delete ${expense.name}`}><Trash2 className="size-4" /></button>
                        </div>
                        {expense.note && <p className="col-span-2 min-w-0 text-sm leading-relaxed text-blue/65 sm:hidden">{expense.note}</p>}
                    </div>
                )) : <EmptyState icon={ReceiptText} title="No expenses yet" description="Your recorded expenses will appear here." />}
            </div>
        </section>
        </>}
    </main>
    <Modal isOpen={modal === "expense"} onClose={() => setModal(null)} title="Log Expense"><form onSubmit={submitExpense} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Expense name" value={expenseDraft.name} onChange={(e) => setExpenseDraft({ ...expenseDraft, name: e.target.value })} required /><MoneyInput value={expenseDraft.amount} onValueChange={(amount) => setExpenseDraft({ ...expenseDraft, amount })} placeholder="Amount" required /><select className="h-12 w-full rounded-xl border px-4" value={expenseDraft.categoryId} onChange={(e) => setExpenseDraft({ ...expenseDraft, categoryId: e.target.value })} required><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><CalendarInput mode="single" value={expenseDraft.occurredAt} onChange={(occurredAt) => setExpenseDraft({ ...expenseDraft, occurredAt })} placeholder="Select expense date" /><textarea className="min-h-24 w-full resize-y rounded-xl border px-4 py-3" maxLength={500} placeholder="Add a note (optional)" value={expenseDraft.note} onChange={(e) => setExpenseDraft({ ...expenseDraft, note: e.target.value })} /><Button type="submit" label="Save Expense" variant="dark" className="w-full" disabled={!categories.length} /></form></Modal>
    <Modal isOpen={modal === "edit-expense"} onClose={() => { setModal(null); setSelectedExpense(null); }} title="Edit Expense"><form onSubmit={updateExpense} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Expense name" value={editExpenseDraft.name} onChange={(e) => setEditExpenseDraft({ ...editExpenseDraft, name: e.target.value })} required /><MoneyInput value={editExpenseDraft.amount} onValueChange={(amount) => setEditExpenseDraft({ ...editExpenseDraft, amount })} placeholder="Amount" required /><select className="h-12 w-full rounded-xl border px-4" value={editExpenseDraft.categoryId} onChange={(e) => setEditExpenseDraft({ ...editExpenseDraft, categoryId: e.target.value })} required>{selectedExpense && !categories.some((category) => category._id === selectedExpense.category._id) && <option value={selectedExpense.category._id}>{selectedExpense.category.name} (deleted)</option>}{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><CalendarInput mode="single" value={editExpenseDraft.occurredAt} onChange={(occurredAt) => setEditExpenseDraft({ ...editExpenseDraft, occurredAt })} placeholder="Select expense date" /><textarea className="min-h-24 w-full resize-y rounded-xl border px-4 py-3" maxLength={500} placeholder="Add a note (optional)" value={editExpenseDraft.note} onChange={(e) => setEditExpenseDraft({ ...editExpenseDraft, note: e.target.value })} /><Button type="submit" label="Update Expense" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "delete-expense"} onClose={() => { setModal(null); setSelectedExpense(null); }} title="Delete Expense"><div><p className="text-sm leading-relaxed text-blue/70">Permanently delete <strong className="text-blue">{selectedExpense?.name}</strong>? This will update your spending totals and cannot be undone.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button label="Cancel" className="w-full" onClick={() => { setModal(null); setSelectedExpense(null); }} /><Button label="Delete Expense" variant="dark" className="w-full bg-red-700 hover:bg-red-600" onClick={deleteExpense} /></div></div></Modal>
    <Modal isOpen={modal === "income"} onClose={() => setModal(null)} title="Add Income"><form onSubmit={submitIncome} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Income source" value={incomeDraft.source} onChange={(e) => setIncomeDraft({ ...incomeDraft, source: e.target.value })} required /><MoneyInput value={incomeDraft.amount} onValueChange={(amount) => setIncomeDraft({ ...incomeDraft, amount })} placeholder="Amount" required /><CalendarInput mode="single" value={incomeDraft.receivedAt} onChange={(receivedAt) => setIncomeDraft({ ...incomeDraft, receivedAt })} placeholder="Select income date" /><Button type="submit" label="Save Income" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "monthly-income"} onClose={() => setModal(null)} title="Monthly Income"><form onSubmit={saveMonthlyIncome} className="space-y-4"><p className="text-sm text-blue/65">Set the regular income you expect each month. One-off income can still be recorded separately.</p><MoneyInput value={monthlyIncomeDraft} onValueChange={setMonthlyIncomeDraft} placeholder="Monthly income" required /><Button type="submit" label="Save Monthly Income" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "category"} onClose={() => setModal(null)} title="Add Budget Category"><form onSubmit={submitCategory} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Category name" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} required /><MoneyInput value={categoryDraft.monthlyLimit} onValueChange={(monthlyLimit) => setCategoryDraft({ ...categoryDraft, monthlyLimit })} placeholder="Monthly budget" required /><Button type="submit" label="Save Category" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "edit-category"} onClose={() => { setModal(null); setSelectedCategory(null); setCategoryDraft({ name: "", monthlyLimit: "" }); }} title="Edit Budget Category"><form onSubmit={updateCategory} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Category name" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} required /><MoneyInput value={categoryDraft.monthlyLimit} onValueChange={(monthlyLimit) => setCategoryDraft({ ...categoryDraft, monthlyLimit })} placeholder="Monthly budget" required /><Button type="submit" label="Update Category" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "delete-category"} onClose={() => { setModal(null); setSelectedCategory(null); }} title="Delete Budget Category"><div><p className="text-sm leading-relaxed text-blue/70">Delete <strong className="text-blue">{selectedCategory?.name}</strong> from your active budget? Existing expenses will remain in your history.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button label="Cancel" className="w-full" onClick={() => { setModal(null); setSelectedCategory(null); }} /><Button label="Delete Category" variant="dark" className="w-full bg-red-700 hover:bg-red-600" onClick={deleteCategory} /></div></div></Modal>
    <Modal isOpen={modal === "history"} onClose={() => setModal(null)} title="Expense History" size="large">
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-blue p-4 text-light-blue sm:p-5">
            <div className="min-w-0"><p className="text-xs uppercase tracking-widest opacity-70">Total recorded</p><PrivateAmount value={currencyFormatter.format(totals.totalSpent)} className="mt-2 text-xl font-bold sm:text-2xl" /></div>
            <History className="size-7" />
        </div>
        <div className="max-h-96 overflow-y-auto rounded-2xl border border-blue/10">
            {expenses.length > 0 && <div className="sticky top-0 z-10 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(7rem,0.7fr)_minmax(8rem,0.8fr)_4.5rem] gap-4 border-b border-blue/10 bg-light-blue px-4 py-3 text-xs font-semibold uppercase tracking-widest text-blue/45 sm:grid"><span>Expense</span><span>Note</span><span>Category</span><span className="text-right">Amount</span><span className="text-center">Actions</span></div>}
            {expenses.map((expense) => (
                <div key={expense._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-blue/10 px-3 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(7rem,0.7fr)_minmax(8rem,0.8fr)_4.5rem] sm:gap-4 sm:px-4">
                    <div className="min-w-0"><p className="truncate font-semibold">{expense.name}</p><p className="mt-1 text-xs text-blue/55">{new Date(expense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div>
                    <p className="hidden min-w-0 whitespace-pre-line text-sm leading-relaxed text-blue/65 sm:block">{expense.note || "—"}</p>
                    <p className="hidden text-sm text-blue/65 sm:block">{expense.category.name}</p>
                    <PrivateAmount value={currencyFormatter.format(expense.amount)} className="hidden justify-self-end whitespace-nowrap text-sm font-bold tracking-wide sm:inline-flex sm:text-base" />
                    <div className="hidden items-center justify-end gap-1.5 sm:flex">
                        <button type="button" onClick={() => openEditExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue/15 transition hover:bg-blue hover:text-light-blue" aria-label={`Edit ${expense.name}`}><Pencil className="size-4" /></button>
                        <button type="button" onClick={() => openDeleteExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-100" aria-label={`Delete ${expense.name}`}><Trash2 className="size-4" /></button>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 sm:hidden">
                        <PrivateAmount value={currencyFormatter.format(expense.amount)} className="mr-1 whitespace-nowrap text-sm font-bold tracking-wide" />
                        <button type="button" onClick={() => openEditExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-blue/15 transition hover:bg-blue hover:text-light-blue" aria-label={`Edit ${expense.name}`}><Pencil className="size-4" /></button>
                        <button type="button" onClick={() => openDeleteExpense(expense)} className="grid size-8 shrink-0 place-items-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-100" aria-label={`Delete ${expense.name}`}><Trash2 className="size-4" /></button>
                    </div>
                    {expense.note && <p className="col-span-2 min-w-0 whitespace-pre-line text-sm leading-relaxed text-blue/65 sm:hidden">{expense.note}</p>}
                </div>
            ))}
        </div>
    </Modal>
    </Layout>;
}
