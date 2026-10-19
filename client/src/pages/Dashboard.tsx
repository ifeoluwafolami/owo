import Button from "../components/Button";
import Layout from "../components/Layout";
import OverviewCard from "../components/OverviewCard";
import { CircleDollarSign, PiggyBank, Target, WalletCards } from "lucide-react";
import { useState } from "react";
import SavingsGoalCard from "../components/SavingsGoalCard";
import ExpenseCard from "../components/ExpenseCard";
import { getWelcomeMessage } from "../welcomeMessage";
import appData from "../data/appData.json";

const statIcons = {
    piggyBank: PiggyBank,
    target: Target,
    circleDollarSign: CircleDollarSign,
    walletCards: WalletCards,
};

export default function Overview() {
    const [welcomeMessage] = useState(getWelcomeMessage);


    return (
        <Layout showHeader={true}>
            <div className="relative z-100 min-h-screen overflow-hidden py-12 px-16">
               
                <div className="flex justify-between mb-4">
                    <div className="flex flex-col gap-2">
                        <p className="uppercase text-xs tracking-wide font-ferrite">{welcomeMessage[0]}</p>
                        <h1 className="text-3xl tracking-wide">{welcomeMessage[1]}</h1>
                    </div>
                    <Button label="Log an Expense" />
                </div>
                
                
                <div className="grid w-full grid-cols-1 gap-4 rounded-2xl bg-blue/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                    {appData.overviewStats.map((stat) => (
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
                        <Button label="View Spending" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 rounded-2xl bg-blue/20 p-4 lg:grid-cols-3">
                        {appData.recentExpenses.map((expense) => (
                            <ExpenseCard
                                key={expense.id}
                                expenseName={expense.expenseName}
                                amount={expense.amount}
                                category={expense.category}
                                categoryBudget={expense.categoryBudget}
                                date={expense.date}
                                className="transition duration-300 hover:scale-102"
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-12">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <p className="uppercase tracking-wide font-ferrite text-xs">Money on a mission.</p>
                            <h1 className="text-3xl tracking-wide">Savings Targets</h1>
                        </div>
                        <Button label="View Savings" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 rounded-2xl bg-blue/20 p-4">
                        {appData.savingsGoals.map((goal) => (
                            <SavingsGoalCard
                                key={goal.id}
                                title={goal.title}
                                targetAmount={goal.targetAmount}
                                savedAmount={goal.savedAmount}
                                className="transition duration-300 hover:scale-102"
                            />
                        ))}
                    </div>

                    
                </div>


            </div>
            
        </Layout>
    )
}
