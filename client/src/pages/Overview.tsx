import { CircleDollarSign, PiggyBank, ReceiptText, Target, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ExpenseCard from "../components/ExpenseCard";
import Layout from "../components/Layout";
import OverviewCard from "../components/OverviewCard";
import SavingsGoalCard from "../components/SavingsGoalCard";
import type { Expense, SavingsGoal } from "../finance";
import { getWelcomeMessage } from "../welcomeMessage";
import { useAuth } from "../auth";

interface OverviewData {
    overview: {
        totalSaved: number;
        savedThisMonth: number;
        spentThisMonth: number;
        remainingBudget: number;
    };
    recentExpenses: Expense[];
}

export default function Overview() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [welcomeMessage] = useState(() => getWelcomeMessage(user?.firstName));
    const [data, setData] = useState<OverviewData | null>(null);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        void Promise.all([
            api<OverviewData>("/overview"),
            api<{ goals: SavingsGoal[] }>("/savings/goals"),
        ]).then(([overview, savings]) => {
            setData(overview);
            setGoals(savings.goals);
        }).catch((reason: Error) => setError(reason.message));
    }, []);

    const stats = [
        { id: "total", title: "Total saved", amount: data?.overview.totalSaved ?? 0, icon: PiggyBank, supportingText: "Across all savings targets" },
        { id: "saved", title: "Saved this month", amount: data?.overview.savedThisMonth ?? 0, icon: Target, supportingText: "Added in the current month" },
        { id: "spent", title: "Spent this month", amount: data?.overview.spentThisMonth ?? 0, icon: CircleDollarSign, supportingText: "Across all categories" },
        { id: "remaining", title: "Remaining budget", amount: data?.overview.remainingBudget ?? 0, icon: WalletCards, supportingText: "Available this month" },
    ];

    return <Layout showHeader>
        <main className="relative z-100 min-h-screen px-6 py-12 sm:px-10 lg:px-16">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div><p className="font-ferrite text-xs uppercase tracking-wide">{welcomeMessage[0]}</p><h1 className="mt-2 text-3xl">{welcomeMessage[1]}</h1></div>
                <Button label="Log an Expense" onClick={() => navigate("/spending?action=add-expense")} />
            </div>
            {error && <p role="alert" className="mb-5 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
            <div className="grid gap-4 rounded-2xl bg-blue/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => <OverviewCard key={stat.id} {...stat} />)}
            </div>
            <section className="mt-12">
                <div className="mb-5 flex items-end justify-between"><div><p className="font-ferrite text-xs uppercase">Every naira, accounted for.</p><h2 className="mt-2 text-3xl">Recent Expenses</h2></div><Button label="View Spending" onClick={() => navigate("/spending")} /></div>
                <div className="grid gap-6 rounded-2xl bg-blue/20 p-4 lg:grid-cols-3">
                    {data?.recentExpenses.length ? data.recentExpenses.map((expense) => <ExpenseCard key={expense._id} expenseName={expense.name} amount={expense.amount} category={expense.category.name} categoryBudget={expense.category.monthlyLimit} date={new Date(expense.occurredAt).toLocaleDateString("en-NG", { dateStyle: "medium" })} />) : <EmptyState icon={ReceiptText} title="No expenses yet" description="Record your first expense to see it here." actionLabel="Go to Spending" onAction={() => navigate("/spending")} className="lg:col-span-3" />}
                </div>
            </section>
            <section className="mt-12">
                <div className="mb-5 flex items-end justify-between"><div><p className="font-ferrite text-xs uppercase">Money on a mission.</p><h2 className="mt-2 text-3xl">Savings Targets</h2></div><Button label="View Savings" onClick={() => navigate("/savings")} /></div>
                <div className="grid gap-6 rounded-2xl bg-blue/20 p-4 md:grid-cols-2">
                    {goals.length ? goals.slice(0, 4).map((goal) => <SavingsGoalCard key={goal._id} title={goal.title} targetAmount={goal.targetAmount} savedAmount={goal.savedAmount} targetDate={goal.targetDate} />) : <EmptyState icon={PiggyBank} title="No savings targets yet" description="Create a target and start tracking progress." actionLabel="Go to Savings" onAction={() => navigate("/savings")} className="md:col-span-2" />}
                </div>
            </section>
        </main>
    </Layout>;
}
