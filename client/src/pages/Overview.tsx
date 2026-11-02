import { CircleDollarSign, PiggyBank, ReceiptText, Target, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import OverviewCard from "../components/OverviewCard";
import RecentExpenseCategoryCard from "../components/RecentExpenseCategoryCard";
import SavingsGoalCard from "../components/SavingsGoalCard";
import type { ActiveBudgetCategory, SavingsGoal } from "../finance";
import { getWelcomeMessage } from "../welcomeMessage";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";

interface OverviewData {
    overview: {
        totalSaved: number;
        extraIncomeThisMonth: number;
        savedThisMonth: number;
        spentThisMonth: number;
        remainingBudget: number;
    };
    activeBudgetCategories: ActiveBudgetCategory[];
}

export default function Overview() {
    const toast = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [welcomeMessage] = useState(() => getWelcomeMessage(user?.firstName));
    const [data, setData] = useState<OverviewData | null>(null);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        void Promise.all([
            api<OverviewData>("/overview"),
            api<{ goals: SavingsGoal[] }>("/savings/goals"),
        ]).then(([overview, savings]) => {
            setData(overview);
            setGoals(savings.goals);
        }).catch((reason: Error) => toast.error(reason.message))
            .finally(() => setIsLoading(false));
    }, [toast]);

    const stats = [
        { id: "income", title: "Income this month", amount: (user?.monthlyIncome ?? 0) + (data?.overview.extraIncomeThisMonth ?? 0), icon: CircleDollarSign, supportingText: "Monthly + extra income" },
        { id: "saved", title: "Saved this month", amount: data?.overview.savedThisMonth ?? 0, icon: Target, supportingText: "Saved toward your goals" },
        { id: "spent", title: "Spent this month", amount: data?.overview.spentThisMonth ?? 0, icon: CircleDollarSign, supportingText: "Across your categories" },
        { id: "remaining", title: "Budget left", amount: data?.overview.remainingBudget ?? 0, icon: WalletCards, supportingText: "Available this month" },
    ];

    return <Layout showHeader>
        <main className="relative z-100 min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12">
            <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="font-ferrite text-xs uppercase tracking-wide">{welcomeMessage[0]}</p><h1 className="mt-2 text-2xl sm:text-3xl">{welcomeMessage[1]}</h1></div>
                <Button label="Log an Expense" className="w-full sm:w-auto" onClick={() => navigate("/spending?action=add-expense")} />
            </div>
            {isLoading ? <LoadingState label="Loading your overview…" className="mt-6" /> : <>
            <div className="grid gap-3 rounded-2xl bg-blue/20 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 xl:grid-cols-4">
                {stats.map((stat) => <OverviewCard key={stat.id} {...stat} />)}
            </div>
            <section className="mt-8 sm:mt-12">
                <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ferrite text-xs uppercase">Every naira, accounted for.</p><h2 className="mt-2 text-2xl sm:text-3xl">Recent Expenses</h2></div><Button label="View Spending" className="w-full sm:w-auto" onClick={() => navigate("/spending")} /></div>
                <div className="grid gap-4 rounded-2xl bg-blue/20 p-3 sm:p-4 lg:grid-cols-3 lg:gap-6">
                    {data?.activeBudgetCategories.length ? data.activeBudgetCategories.map((activity) => <RecentExpenseCategoryCard key={activity.category._id} activity={activity} />) : <EmptyState icon={ReceiptText} title="No active budget categories" description="Categories you spend from this month will appear here." actionLabel="Go to Spending" onAction={() => navigate("/spending")} className="lg:col-span-3" />}
                </div>
            </section>
            <section className="mt-8 sm:mt-12">
                <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ferrite text-xs uppercase">Money on a mission.</p><h2 className="mt-2 text-2xl sm:text-3xl">Savings Targets</h2></div><Button label="View Savings" className="w-full sm:w-auto" onClick={() => navigate("/savings")} /></div>
                <div className="grid gap-4 rounded-2xl bg-blue/20 p-3 sm:p-4 md:grid-cols-2 lg:gap-6">
                    {goals.length ? goals.slice(0, 4).map((goal) => <SavingsGoalCard key={goal._id} title={goal.title} targetAmount={goal.targetAmount} savedAmount={goal.savedAmount} targetDate={goal.targetDate} />) : <EmptyState icon={PiggyBank} title="No savings targets yet" description="Create a target and start tracking progress." actionLabel="Go to Savings" onAction={() => navigate("/savings")} className="md:col-span-2" />}
                </div>
            </section>
            </>}
        </main>
    </Layout>;
}
