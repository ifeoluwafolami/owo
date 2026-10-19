import Layout from "../components/Layout";
import Button from "../components/Button";
import OverviewCard from "../components/OverviewCard";
import SavingsGoalCard from "../components/SavingsGoalCard";
import { CircleDollarSign, PiggyBank, Target, WalletCards } from "lucide-react";
import appData from "../data/appData.json";

const statIcons = {
    piggyBank: PiggyBank,
    target: Target,
    circleDollarSign: CircleDollarSign,
    walletCards: WalletCards,
};

export default function Savings() {
    return (
        <Layout showHeader={true}>
            <div className="relative z-100 min-h-screen overflow-hidden px-16 py-12">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <p className="font-ferrite text-xs uppercase tracking-wide">SAVE, ON PURPOSE.</p>
                        <h1 className="text-3xl tracking-wide">Savings</h1>
                    </div>
                    <Button label="New Savings Goal" />
                </div>

                <div className="grid w-full grid-cols-1 gap-4 rounded-2xl bg-blue/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
                    {appData.savingsStats.map((stat) => (
                        <OverviewCard
                            key={stat.id}
                            title={stat.title}
                            amount={stat.amount}
                            icon={statIcons[stat.icon as keyof typeof statIcons]}
                            supportingText={stat.supportingText}
                        />
                    ))}
                </div>

                <section className="mt-12 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="font-ferrite text-xs uppercase tracking-wide">Money on a mission.</p>
                            <h2 className="text-3xl tracking-wide">Your Savings Targets</h2>
                        </div>
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
                </section>
            </div>
        </Layout>
    );
}
