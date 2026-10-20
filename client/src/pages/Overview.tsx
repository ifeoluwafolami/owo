import Button from "../components/Button";
import Layout from "../components/Layout";
import OverviewCard from "../components/OverviewCard";
import { CircleDollarSign, PiggyBank, ReceiptText, Target, WalletCards } from "lucide-react";
import { useState } from "react";
import SavingsGoalCard from "../components/SavingsGoalCard";
import ExpenseCard from "../components/ExpenseCard";
import { getWelcomeMessage } from "../welcomeMessage";
import appData from "../data/appData.json";
import { ALL_DATA_RESET_KEY, EXPENSE_HISTORY_CLEARED_KEY, NEW_ACCOUNT_KEY, USER_SAVINGS_GOALS_KEY } from "../settingsStorage";
import EmptyState from "../components/EmptyState";
import { useNavigate } from "react-router-dom";

const statIcons = {
    piggyBank: PiggyBank,
    target: Target,
    circleDollarSign: CircleDollarSign,
    walletCards: WalletCards,
};

function loadStoredGoals(): typeof appData.savingsGoals | null {
    const storedGoals = localStorage.getItem(USER_SAVINGS_GOALS_KEY);
    if (!storedGoals) return null;

    try {
        return JSON.parse(storedGoals) as typeof appData.savingsGoals;
    } catch {
        return null;
    }
}

export default function Overview() {
    const navigate = useNavigate();
    const [welcomeMessage] = useState(getWelcomeMessage);
    const isAllDataReset = localStorage.getItem(ALL_DATA_RESET_KEY) === "true";
    const isNewAccount = localStorage.getItem(NEW_ACCOUNT_KEY) === "true";
    const isExpenseHistoryCleared = localStorage.getItem(EXPENSE_HISTORY_CLEARED_KEY) === "true";
    const overviewStats = isAllDataReset || isNewAccount
        ? appData.overviewStats.map((stat) => ({ ...stat, amount: 0 }))
        : appData.overviewStats;
    const recentExpenses = isAllDataReset || isNewAccount || isExpenseHistoryCleared ? [] : appData.recentExpenses;
    const storedGoals = loadStoredGoals();
    const savingsGoals = isAllDataReset || isNewAccount ? storedGoals ?? [] : storedGoals ?? appData.savingsGoals;


    return (
        <Layout showHeader={true}>
            <div className="relative z-100 min-h-screen overflow-hidden py-12 px-16">
               
                <div className="flex justify-between mb-4">
                    <div className="flex flex-col gap-2">
                        <p className="uppercase text-xs tracking-wide font-ferrite">{welcomeMessage[0]}</p>
                        <h1 className="text-3xl tracking-wide">{welcomeMessage[1]}</h1>
                    </div>
                    <Button label="Log an Expense" onClick={() => navigate("/spending?action=add-expense")} />
                </div>
                
                
                <div className="grid w-full grid-cols-1 gap-4 rounded-2xl bg-blue/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                    {overviewStats.map((stat) => (
                        <OverviewCard
                            key={stat.id}
                            title={stat.title}
                            amount={stat.amount}
                            icon={statIcons[stat.icon as keyof typeof statIcons]}
                            supportingText={stat.supportingText}
                        />
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="font-ferrite text-xs uppercase tracking-wide">Every naira, accounted for.</p>
                            <h1 className="text-3xl tracking-wide">Recent Expenses</h1>
                        </div>
                        <Button label="View Spending" onClick={() => navigate("/spending")} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 rounded-2xl bg-blue/20 p-4 lg:grid-cols-3">
                        {recentExpenses.length > 0 ? (
                            recentExpenses.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    expenseName={expense.expenseName}
                                    amount={expense.amount}
                                    category={expense.category}
                                    categoryBudget={expense.categoryBudget}
                                    date={expense.date}
                                    className="transition duration-300 hover:scale-102"
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={ReceiptText}
                                title="No expenses yet"
                                description="Your recent spending will appear here after you record your first expense."
                                actionLabel="Go to Spending"
                                onAction={() => navigate("/spending")}
                                className="lg:col-span-3"
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-12">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <p className="uppercase tracking-wide font-ferrite text-xs">Money on a mission.</p>
                            <h1 className="text-3xl tracking-wide">Savings Targets</h1>
                        </div>
                        <Button label="View Savings" onClick={() => navigate("/savings")} />
                    </div>

                    <div className="grid grid-cols-2 gap-6 rounded-2xl bg-blue/20 p-4">
                        {savingsGoals.length > 0 ? (
                            savingsGoals.map((goal) => (
                                <SavingsGoalCard
                                    key={goal.id}
                                    title={goal.title}
                                    targetAmount={goal.targetAmount}
                                    savedAmount={goal.savedAmount}
                                    targetDate={goal.targetDate}
                                    className="transition duration-300 hover:scale-102"
                                />
                            ))
                        ) : (
                            <EmptyState
                                icon={PiggyBank}
                                title="No savings targets yet"
                                description="Create a target to give your savings a purpose and track your progress."
                                actionLabel="Go to Savings"
                                onAction={() => navigate("/savings")}
                                className="col-span-2"
                            />
                        )}
                    </div>

                    
                </div>


            </div>
            
        </Layout>
    )
}
