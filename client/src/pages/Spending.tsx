import { useCallback, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, CircleDollarSign, Plus, ReceiptText, WalletCards, X } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import OverviewCard from "../components/OverviewCard";
import BudgetCategoryCard from "../components/BudgetCategoryCard";
import ExpenseCard from "../components/ExpenseCard";
import Modal from "../components/Modal";
import CalendarInput from "../components/CalendarInput";
import MoneyInput from "../components/MoneyInput";
import appData from "../data/appData.json";

interface BudgetCategory {
    id: string;
    name: string;
    budget: number;
    spent: number;
}

interface BudgetCategoryDraft extends Omit<BudgetCategory, "budget"> {
    budget: string;
}

type Expense = (typeof appData.recentExpenses)[number];

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
});

const inputClasses = "h-12 w-full rounded-xl border border-blue/20 bg-white/40 px-4 text-blue outline-none transition placeholder:text-blue/40 focus:border-blue focus:ring-2 focus:ring-blue/15";

function createCategoryDrafts(categories: BudgetCategory[]): BudgetCategoryDraft[] {
    return categories.map((category) => ({ ...category, budget: String(category.budget) }));
}

function getExpenseDateKey(date: string) {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function Spending() {
    const [salary, setSalary] = useState(appData.spending.salary);
    const [extraIncome, setExtraIncome] = useState(appData.spending.extraIncome);
    const [categories, setCategories] = useState<BudgetCategory[]>(appData.spending.budgetCategories);
    const [expenses, setExpenses] = useState<Expense[]>(appData.recentExpenses);
    const [isBudgetOpen, setIsBudgetOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [transactionMode, setTransactionMode] = useState<"income" | "expense">("income");
    const [useDateRange, setUseDateRange] = useState(false);
    const [rangeStart, setRangeStart] = useState("2026-10-01");
    const [rangeEnd, setRangeEnd] = useState("2026-10-19");
    const [draftSalary, setDraftSalary] = useState(String(appData.spending.salary));
    const [draftCategories, setDraftCategories] = useState<BudgetCategoryDraft[]>(() => createCategoryDrafts(appData.spending.budgetCategories));
    const [newExpense, setNewExpense] = useState({
        expenseName: "",
        amount: "",
        categoryId: appData.spending.budgetCategories[0].id,
        date: "",
    });
    const [newIncome, setNewIncome] = useState({ source: "", amount: "" });

    const totalIncome = salary + extraIncome;
    const totalSpent = categories.reduce((total, category) => total + category.spent, 0);
    const totalBudget = categories.reduce((total, category) => total + category.budget, 0);
    const amountAvailable = Math.max(totalBudget - totalSpent, 0);
    const budgetUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const budgetProgressWidth = Math.min(budgetUsed, 100);
    const draftBudgetTotal = draftCategories.reduce((total, category) => total + Number(category.budget || 0), 0);

    const filteredExpenses = useMemo(() => {
        if (!useDateRange) return expenses;

        return expenses.filter((expense) => {
            const expenseDate = getExpenseDateKey(expense.date);
            const afterStart = !rangeStart || expenseDate >= rangeStart;
            const beforeEnd = !rangeEnd || expenseDate <= rangeEnd;
            return expenseDate && afterStart && beforeEnd;
        });
    }, [expenses, rangeEnd, rangeStart, useDateRange]);

    const historyTotal = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);

    const closeBudget = useCallback(() => setIsBudgetOpen(false), []);
    const closeHistory = useCallback(() => setIsHistoryOpen(false), []);
    const closeTransaction = useCallback(() => setIsTransactionOpen(false), []);

    const openTransaction = (mode: "income" | "expense") => {
        setTransactionMode(mode);
        setIsTransactionOpen(true);
    };

    const openBudgetReview = () => {
        setDraftSalary(String(salary));
        setDraftCategories(createCategoryDrafts(categories));
        setIsBudgetOpen(true);
    };

    const addDraftCategory = () => {
        setDraftCategories((currentCategories) => [
            ...currentCategories,
            {
                id: `category-${Date.now()}`,
                name: "",
                budget: "",
                spent: 0,
            },
        ]);
    };

    const updateDraftCategory = (id: string, changes: Partial<Pick<BudgetCategoryDraft, "name" | "budget">>) => {
        setDraftCategories((currentCategories) =>
            currentCategories.map((category) => category.id === id ? { ...category, ...changes } : category),
        );
    };

    const deleteDraftCategory = (id: string) => {
        setDraftCategories((currentCategories) => currentCategories.filter((category) => category.id !== id));
    };

    const handleSaveBudget = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (draftCategories.some((category) => !category.name.trim())) return;

        const nextCategories = draftCategories.map((category) => ({
            ...category,
            name: category.name.trim(),
            budget: Math.max(Number(category.budget), 0),
        }));
        const renamedCategories = new Map(
            categories
                .map((category) => {
                    const updatedCategory = nextCategories.find((draft) => draft.id === category.id);
                    return updatedCategory ? [category.name, updatedCategory] as const : null;
                })
                .filter((entry): entry is readonly [string, BudgetCategory] => entry !== null),
        );

        setSalary(Math.max(Number(draftSalary), 0));
        setCategories(nextCategories);
        setExpenses((currentExpenses) =>
            currentExpenses.map((expense) => {
                const updatedCategory = renamedCategories.get(expense.category);
                return updatedCategory
                    ? { ...expense, category: updatedCategory.name, categoryBudget: updatedCategory.budget }
                    : expense;
            }),
        );
        setNewExpense((expense) => ({
            ...expense,
            categoryId: nextCategories.some((category) => category.id === expense.categoryId)
                ? expense.categoryId
                : nextCategories[0]?.id ?? "",
        }));
        closeBudget();
    };

    const handleAddExpense = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const amount = Number(newExpense.amount);
        const category = categories.find((item) => item.id === newExpense.categoryId);
        if (!newExpense.expenseName.trim() || amount <= 0 || !category || !newExpense.date) return;

        const expense: Expense = {
            id: `expense-${Date.now()}`,
            expenseName: newExpense.expenseName.trim(),
            amount,
            category: category.name,
            categoryBudget: category.budget,
            date: dateFormatter.format(new Date(`${newExpense.date}T00:00:00Z`)),
        };

        setExpenses((currentExpenses) => [expense, ...currentExpenses]);
        setCategories((currentCategories) =>
            currentCategories.map((item) =>
                item.id === category.id ? { ...item, spent: item.spent + amount } : item,
            ),
        );
        setNewExpense({
            expenseName: "",
            amount: "",
            categoryId: categories[0]?.id ?? "",
            date: "",
        });
        closeTransaction();
    };

    const handleAddIncome = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const amount = Number(newIncome.amount);
        if (!newIncome.source.trim() || amount <= 0) return;

        setExtraIncome((currentIncome) => currentIncome + amount);
        setNewIncome({ source: "", amount: "" });
        closeTransaction();
    };

    return (
        <Layout showHeader={true}>
            <div className="relative z-100 min-h-screen overflow-hidden px-16 py-12">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <p className="font-ferrite text-xs uppercase tracking-wide">SPEND, WITH INTENTION.</p>
                        <h1 className="text-3xl tracking-wide">Spending</h1>
                    </div>
                    <Button label="Add Income/Expense" onClick={() => openTransaction("income")} />
                </div>

                <div className="grid w-full grid-cols-1 gap-4 rounded-2xl bg-blue/20 p-4 md:grid-cols-3">
                    <OverviewCard
                        title="Income this month"
                        amount={totalIncome}
                        icon={CircleDollarSign}
                        supportingText={`${currencyFormatter.format(salary)} salary + ${currencyFormatter.format(extraIncome)} extra`}
                        animate={false}
                    />
                    <OverviewCard
                        title="Total monthly budget"
                        amount={totalBudget}
                        icon={WalletCards}
                        supportingText="Across all budget categories"
                        animate={false}
                    />
                    <OverviewCard
                        title="Amount spent"
                        amount={totalSpent}
                        icon={ReceiptText}
                        supportingText={`${currencyFormatter.format(amountAvailable)} remaining available to spend`}
                        animate={false}
                    />
                </div>

                <section className="mt-12 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="font-ferrite text-xs uppercase tracking-wide">Know where it goes.</p>
                            <h2 className="text-3xl tracking-wide">Budget Categories</h2>
                        </div>
                        <Button label="Review Budget" onClick={openBudgetReview} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-5 rounded-2xl bg-blue/20 p-4">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <div key={category.id} className="w-full md:w-[calc(50%-0.625rem)] xl:w-[calc(33.333%-0.875rem)]">
                                    <BudgetCategoryCard
                                        name={category.name}
                                        spent={category.spent}
                                        budget={category.budget}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="w-full rounded-2xl bg-light-blue p-8 text-center text-blue/60">
                                No budget categories yet. Use Review Budget to create one.
                            </p>
                        )}
                    </div>
                </section>

                <section className="mt-12 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="font-ferrite text-xs uppercase tracking-wide">Every naira, accounted for.</p>
                            <h2 className="text-3xl tracking-wide">Recent Expenses</h2>
                        </div>
                        <Button label="View History" onClick={() => setIsHistoryOpen(true)} />
                    </div>
                    <div className="grid grid-cols-1 gap-6 rounded-2xl bg-blue/20 p-4 lg:grid-cols-3">
                        {expenses.map((expense) => {
                            const category = categories.find((item) => item.name === expense.category);
                            return (
                                <ExpenseCard
                                    key={expense.id}
                                    expenseName={expense.expenseName}
                                    amount={expense.amount}
                                    category={expense.category}
                                    categoryBudget={category?.budget ?? expense.categoryBudget}
                                    categorySpent={category?.spent}
                                    date={expense.date}
                                    animate={false}
                                />
                            );
                        })}
                    </div>
                </section>
            </div>

            <Modal isOpen={isBudgetOpen} onClose={closeBudget} title="Review Monthly Budget" size="large">
                <form onSubmit={handleSaveBudget}>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-blue p-4 text-light-blue">
                            <p className="text-xs uppercase tracking-widest opacity-70">Monthly income</p>
                            <p className="mt-2 text-xl font-bold tracking-wider">{currencyFormatter.format(totalIncome)}</p>
                        </div>
                        <div className="rounded-2xl bg-blue/10 p-4">
                            <p className="text-xs uppercase tracking-widest text-blue/60">Monthly budget</p>
                            <p className="mt-2 text-xl font-bold tracking-wider">{currencyFormatter.format(draftBudgetTotal)}</p>
                        </div>
                        <div className="rounded-2xl bg-blue/10 p-4">
                            <p className="text-xs uppercase tracking-widest text-blue/60">Spent so far</p>
                            <p className="mt-2 text-xl font-bold tracking-wider">{currencyFormatter.format(totalSpent)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Monthly salary
                            <MoneyInput
                                value={draftSalary}
                                onValueChange={setDraftSalary}
                                required
                            />
                        </label>
                        <div className="flex flex-col gap-2 text-sm font-semibold">
                            Extra income
                            <div className="flex h-12 items-center rounded-xl bg-blue/10 px-4 tracking-wider text-blue/65">
                                {currencyFormatter.format(extraIncome)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-7">
                        <h3 className="font-ferrite uppercase tracking-wide">Budget categories</h3>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-blue/15 bg-blue/5">
                            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_2.5rem] gap-3 bg-blue/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-blue/60">
                                <span>Category name</span>
                                <span>Monthly budget</span>
                                <span className="sr-only">Actions</span>
                            </div>

                            {draftCategories.length > 0 ? (
                                draftCategories.map((category) => (
                                    <div key={category.id} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_2.5rem] items-center gap-3 border-t border-blue/10 px-4 py-3 first:border-t-0">
                                        <input
                                            type="text"
                                            value={category.name}
                                            onChange={(event) => updateDraftCategory(category.id, { name: event.target.value })}
                                            placeholder="e.g. Entertainment"
                                            aria-label="Category name"
                                            className={inputClasses}
                                            required
                                        />
                                        <MoneyInput
                                            value={category.budget}
                                            onValueChange={(budget) => updateDraftCategory(category.id, { budget })}
                                            placeholder="0"
                                            aria-label={`${category.name || "New category"} monthly budget`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => deleteDraftCategory(category.id)}
                                            aria-label={`Delete ${category.name || "new"} category`}
                                            title="Delete row"
                                            className="grid size-9 place-items-center rounded-xl text-blue/55 transition hover:bg-red-100 hover:text-red-700"
                                        >
                                            <X className="size-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="border-t border-blue/10 px-4 py-6 text-center text-sm text-blue/50">
                                    No categories added yet.
                                </p>
                            )}
                        </div>

                        <div className="mt-3 flex justify-center">
                            <button
                                type="button"
                                onClick={addDraftCategory}
                                aria-label="Add budget category row"
                                title="Add row"
                                className="grid size-10 place-items-center rounded-full bg-blue text-light-blue shadow-md transition hover:scale-105 hover:bg-blue/80"
                            >
                                <Plus className="size-5" />
                            </button>
                        </div>
                    </div>

                    <Button type="submit" label="Save Budget" variant="dark" className="mt-7 w-full" />
                </form>
            </Modal>

            <Modal isOpen={isHistoryOpen} onClose={closeHistory} title="Expense History" size="large">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col justify-center rounded-2xl bg-blue p-5 text-light-blue">
                        <p className="text-xs uppercase tracking-widest">Spent this month</p>
                        <p className="mt-2 text-2xl font-bold tracking-wider">{currencyFormatter.format(totalSpent)}</p>
                    </div>
                    <div className="rounded-2xl bg-blue/10 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-widest text-blue/60">Spent vs budget</p>
                            <span className="font-semibold">{budgetUsed.toFixed(0)}%</span>
                        </div>
                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-blue/15">
                            <div className="h-full rounded-full bg-blue" style={{ width: `${budgetProgressWidth}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-blue/60">
                            {currencyFormatter.format(totalSpent)} of {currencyFormatter.format(totalBudget)}
                        </p>
                    </div>
                </div>

                <div className="my-6 flex rounded-xl bg-blue/10 p-1">
                    <button
                        type="button"
                        onClick={() => setUseDateRange(false)}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${!useDateRange ? "bg-blue text-light-blue" : "text-blue/60"}`}
                    >
                        All time
                    </button>
                    <button
                        type="button"
                        onClick={() => setUseDateRange(true)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${useDateRange ? "bg-blue text-light-blue" : "text-blue/60"}`}
                    >
                        <CalendarDays className="size-4" />
                        Date range
                    </button>
                </div>

                {useDateRange && (
                    <CalendarInput
                        mode="range"
                        startDate={rangeStart}
                        endDate={rangeEnd}
                        onChange={(startDate, endDate) => {
                            setRangeStart(startDate);
                            setRangeEnd(endDate);
                        }}
                    />
                )}

                <div className="mt-6 flex items-center justify-between gap-4">
                    <h3 className="font-ferrite uppercase tracking-wide">Expenses</h3>
                    <p className="bg-blue p-2 font-semibold uppercase tracking-wider text-light-blue">
                        Total: {currencyFormatter.format(historyTotal)}
                    </p>
                </div>

                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between gap-4 rounded-xl bg-blue/10 px-4 py-3">
                                <div>
                                    <p className="font-semibold">{expense.expenseName}</p>
                                    <p className="mt-1 text-sm text-blue/60">{expense.category} · {expense.date}</p>
                                </div>
                                <p className="font-bold tracking-wider">-{currencyFormatter.format(expense.amount)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="rounded-xl bg-blue/10 p-5 text-center text-blue/60">No expenses were added in this range.</p>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isTransactionOpen} onClose={closeTransaction} title="Add Income/Expense">
                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-blue/10 p-1" role="tablist" aria-label="Transaction type">
                    {(["income", "expense"] as const).map((mode) => {
                        const isActive = transactionMode === mode;

                        return (
                            <button
                                key={mode}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setTransactionMode(mode)}
                                className={`h-11 rounded-xl font-ferrite uppercase transition-all duration-300 ${
                                    isActive
                                        ? "bg-blue text-light-blue shadow-md"
                                        : "text-blue/60 hover:bg-blue/10 hover:text-blue"
                                }`}
                            >
                                {mode}
                            </button>
                        );
                    })}
                </div>

                {transactionMode === "income" ? (
                    <form onSubmit={handleAddIncome} className="space-y-5" role="tabpanel">
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Income source
                            <input
                                type="text"
                                value={newIncome.source}
                                onChange={(event) => setNewIncome((income) => ({ ...income, source: event.target.value }))}
                                placeholder="e.g. Freelance project"
                                className={inputClasses}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Amount
                            <MoneyInput
                                value={newIncome.amount}
                                onValueChange={(amount) => setNewIncome((income) => ({ ...income, amount }))}
                                placeholder="0"
                                required
                            />
                        </label>
                        <Button type="submit" label="Add Income" variant="dark" className="w-full" />
                    </form>
                ) : (
                    <form onSubmit={handleAddExpense} className="space-y-5" role="tabpanel">
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Expense
                            <input
                                type="text"
                                value={newExpense.expenseName}
                                onChange={(event) => setNewExpense((expense) => ({ ...expense, expenseName: event.target.value }))}
                                placeholder="e.g. Lunch"
                                className={inputClasses}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Amount
                            <MoneyInput
                                value={newExpense.amount}
                                onValueChange={(amount) => setNewExpense((expense) => ({ ...expense, amount }))}
                                placeholder="0"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Budget category
                            <select
                                value={newExpense.categoryId}
                                onChange={(event) => setNewExpense((expense) => ({ ...expense, categoryId: event.target.value }))}
                                className={inputClasses}
                                required
                                disabled={categories.length === 0}
                            >
                                {categories.length === 0 && <option value="">Create a budget category first</option>}
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                        <div className="flex flex-col gap-2 text-sm font-semibold">
                            <span>Date</span>
                            <CalendarInput
                                mode="single"
                                value={newExpense.date}
                                onChange={(date) => setNewExpense((expense) => ({ ...expense, date }))}
                                placeholder="Select expense date"
                            />
                        </div>
                        <Button
                            type="submit"
                            label="Add Expense"
                            variant="dark"
                            className="w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            disabled={categories.length === 0}
                        />
                    </form>
                )}
            </Modal>
        </Layout>
    );
}
