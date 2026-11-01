import { CircleDollarSign, History, Plus, ReceiptText, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import Button from "../components/Button";
import BudgetCategoryCard from "../components/BudgetCategoryCard";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import MoneyInput from "../components/MoneyInput";
import OverviewCard from "../components/OverviewCard";
import type { BudgetCategory, Expense } from "../finance";
import { currencyFormatter, localDateValue } from "../finance";

interface Income { _id: string; source: string; amount: number; receivedAt: string }

export default function Spending() {
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [modal, setModal] = useState<"expense" | "income" | "category" | "history" | null>(searchParams.get("action") === "add-expense" ? "expense" : null);
    const [error, setError] = useState("");
    const [expenseDraft, setExpenseDraft] = useState({ name: "", amount: "", categoryId: "", occurredAt: localDateValue() });
    const [incomeDraft, setIncomeDraft] = useState({ source: "", amount: "", receivedAt: localDateValue() });
    const [categoryDraft, setCategoryDraft] = useState({ name: "", monthlyLimit: "" });

    useEffect(() => {
        void Promise.all([
            api<{ categories: BudgetCategory[] }>("/budgets"),
            api<{ expenses: Expense[] }>("/expenses?limit=100"),
            api<{ income: Income[] }>("/income?limit=100"),
        ]).then(([budgetResult, expenseResult, incomeResult]) => {
            setCategories(budgetResult.categories);
            setExpenses(expenseResult.expenses);
            setIncome(incomeResult.income);
            setExpenseDraft((draft) => ({ ...draft, categoryId: draft.categoryId || budgetResult.categories[0]?._id || "" }));
        }).catch((reason: Error) => setError(reason.message));
    }, []);

    const totals = useMemo(() => {
        const totalBudget = categories.reduce((sum, item) => sum + item.monthlyLimit, 0);
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        return { totalBudget, totalSpent, totalIncome, remaining: Math.max(0, totalBudget - totalSpent) };
    }, [categories, expenses, income]);

    const submitExpense = async (event: FormEvent) => {
        event.preventDefault(); setError("");
        try {
            const result = await api<{ expense: Expense }>("/expenses", { method: "POST", body: JSON.stringify({ ...expenseDraft, amount: Number(expenseDraft.amount) }) });
            setExpenses((items) => [result.expense, ...items]);
            setExpenseDraft({ name: "", amount: "", categoryId: categories[0]?._id ?? "", occurredAt: localDateValue() });
            setModal(null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save expense."); }
    };

    const submitIncome = async (event: FormEvent) => {
        event.preventDefault(); setError("");
        try {
            const result = await api<{ income: Income }>("/income", { method: "POST", body: JSON.stringify({ ...incomeDraft, amount: Number(incomeDraft.amount) }) });
            setIncome((items) => [result.income, ...items]);
            setIncomeDraft({ source: "", amount: "", receivedAt: localDateValue() });
            setModal(null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save income."); }
    };

    const submitCategory = async (event: FormEvent) => {
        event.preventDefault(); setError("");
        try {
            const result = await api<{ category: BudgetCategory }>("/budgets", { method: "POST", body: JSON.stringify({ name: categoryDraft.name, monthlyLimit: Number(categoryDraft.monthlyLimit) }) });
            setCategories((items) => [...items, result.category]);
            setExpenseDraft((draft) => ({ ...draft, categoryId: draft.categoryId || result.category._id }));
            setCategoryDraft({ name: "", monthlyLimit: "" });
            setModal(null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save category."); }
    };

    return <Layout showHeader><main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-ferrite text-xs uppercase">Plan it. Track it.</p><h1 className="mt-2 text-3xl">Spending</h1></div><div className="flex gap-3"><Button label="Add Income" onClick={() => setModal("income")} /><Button label="Log Expense" onClick={() => setModal("expense")} /></div></div>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard title="Income recorded" amount={totals.totalIncome} icon={CircleDollarSign} supportingText="All recorded income" />
            <OverviewCard title="Monthly budget" amount={totals.totalBudget} icon={WalletCards} supportingText="Across your categories" />
            <OverviewCard title="Total spent" amount={totals.totalSpent} icon={ReceiptText} supportingText="All recorded expenses" />
            <OverviewCard title="Budget remaining" amount={totals.remaining} icon={WalletCards} supportingText="Available to spend" />
        </div>
        <section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl">Budget categories</h2><Button label="Add Category" onClick={() => setModal("category")} /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => {
            const spent = expenses.filter((expense) => expense.category._id === category._id).reduce((sum, expense) => sum + expense.amount, 0);
            return <BudgetCategoryCard key={category._id} name={category.name} spent={spent} budget={category.monthlyLimit} />;
        })}{!categories.length && <EmptyState icon={Plus} title="No budget categories" description="Create a category before recording an expense." actionLabel="Add Category" onAction={() => setModal("category")} className="md:col-span-2" />}</div></section>
        <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl">Expense history</h2>
                <Button label="View More" onClick={() => setModal("history")} disabled={!expenses.length} />
            </div>
            <div className="overflow-hidden rounded-2xl bg-light-blue text-blue shadow-lg">
                {expenses.length ? expenses.slice(0, 5).map((expense) => (
                    <div key={expense._id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-blue/10 px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_1fr_auto]">
                        <div>
                            <p className="font-semibold">{expense.name}</p>
                            <p className="mt-1 text-xs text-blue/55">{new Date(expense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                        </div>
                        <p className="hidden text-sm text-blue/65 sm:block">{expense.category.name}</p>
                        <p className="font-bold tracking-wide">{currencyFormatter.format(expense.amount)}</p>
                    </div>
                )) : <EmptyState icon={ReceiptText} title="No expenses yet" description="Your recorded expenses will appear here." />}
            </div>
        </section>
    </main>
    <Modal isOpen={modal === "expense"} onClose={() => setModal(null)} title="Log Expense"><form onSubmit={submitExpense} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Expense name" value={expenseDraft.name} onChange={(e) => setExpenseDraft({ ...expenseDraft, name: e.target.value })} required /><MoneyInput value={expenseDraft.amount} onValueChange={(amount) => setExpenseDraft({ ...expenseDraft, amount })} placeholder="Amount" required /><select className="h-12 w-full rounded-xl border px-4" value={expenseDraft.categoryId} onChange={(e) => setExpenseDraft({ ...expenseDraft, categoryId: e.target.value })} required><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><input type="date" className="h-12 w-full rounded-xl border px-4" value={expenseDraft.occurredAt} onChange={(e) => setExpenseDraft({ ...expenseDraft, occurredAt: e.target.value })} required /><Button type="submit" label="Save Expense" variant="dark" className="w-full" disabled={!categories.length} /></form></Modal>
    <Modal isOpen={modal === "income"} onClose={() => setModal(null)} title="Add Income"><form onSubmit={submitIncome} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Income source" value={incomeDraft.source} onChange={(e) => setIncomeDraft({ ...incomeDraft, source: e.target.value })} required /><MoneyInput value={incomeDraft.amount} onValueChange={(amount) => setIncomeDraft({ ...incomeDraft, amount })} placeholder="Amount" required /><input type="date" className="h-12 w-full rounded-xl border px-4" value={incomeDraft.receivedAt} onChange={(e) => setIncomeDraft({ ...incomeDraft, receivedAt: e.target.value })} required /><Button type="submit" label="Save Income" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "category"} onClose={() => setModal(null)} title="Add Budget Category"><form onSubmit={submitCategory} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Category name" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} required /><MoneyInput value={categoryDraft.monthlyLimit} onValueChange={(monthlyLimit) => setCategoryDraft({ ...categoryDraft, monthlyLimit })} placeholder="Monthly budget" required /><Button type="submit" label="Save Category" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "history"} onClose={() => setModal(null)} title="Expense History" size="large">
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-blue p-5 text-light-blue">
            <div><p className="text-xs uppercase tracking-widest opacity-70">Total recorded</p><p className="mt-2 text-2xl font-bold">{currencyFormatter.format(totals.totalSpent)}</p></div>
            <History className="size-7" />
        </div>
        <div className="max-h-96 overflow-y-auto rounded-2xl border border-blue/10">
            {expenses.map((expense) => (
                <div key={expense._id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-blue/10 px-4 py-4 last:border-b-0 sm:grid-cols-[1fr_1fr_auto]">
                    <div><p className="font-semibold">{expense.name}</p><p className="mt-1 text-xs text-blue/55">{new Date(expense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div>
                    <p className="hidden text-sm text-blue/65 sm:block">{expense.category.name}</p>
                    <p className="font-bold tracking-wide">{currencyFormatter.format(expense.amount)}</p>
                </div>
            ))}
        </div>
    </Modal>
    </Layout>;
}
