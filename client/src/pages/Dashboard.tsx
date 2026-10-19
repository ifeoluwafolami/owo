import Button from "../components/Button";
import Layout from "../components/Layout";
import OverviewCard from "../components/OverviewCard";
import { CircleDollarSign, PiggyBank, Target, WalletCards } from "lucide-react";
import { useState } from "react";
import SavingsGoalCard from "../components/SavingsGoalCard";
import ExpenseCard from "../components/ExpenseCard";

type WelcomeMessage = [string, string];

function selectMessage(messages: WelcomeMessage[], index: number) {
    return messages[index % messages.length];
}

function getWelcomeMessage(): WelcomeMessage {
    const firstName = "Ifeoluwa";

    const morningMessages: WelcomeMessage[] = [["Hello, sunshine!", "Let’s make today a no-regrets spending day."], [`Good morning, ${firstName}!`, "Let’s keep your wallet out of trouble today."], ["It's a new day.", "No room for excuses!"]];
    const afternoonMessages: WelcomeMessage[] = [["Halfway through the day.", "How's your wallet holding up?"], ["Midday check-in!", "Catch me up on your finances!"], [`Good afternoon, ${firstName}`, "Catch me up on your day!"]];
    const eveningMessages: WelcomeMessage[] = [["The day is winding down.", "Let's see where it all went."], [`Good evening, ${firstName}!`, "Log whatever you spent today, we won’t judge. Much."], [`Hello, ${firstName}.`, "Was today a good money day?"]];
    const nightMessages: WelcomeMessage[] = [[`Burning the midnight oil, ${firstName}?`, "Keep your hands off the “add to cart” button."], [`Good night, ${firstName}.`, "One last look, then bed."], [`Hi, ${firstName}!`, "We love a late night check in."]];

    const time = new Date();
    const messageIndex = time.getDate();
    const hour = time.getHours();

    if (hour < 12) return selectMessage(morningMessages, messageIndex);
    if (hour <= 18) return selectMessage(afternoonMessages, messageIndex);
    if (hour < 21) return selectMessage(eveningMessages, messageIndex);
    return selectMessage(nightMessages, messageIndex);
}

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
                    <OverviewCard
                        title="Total saved"
                        amount={1_123_000}
                        icon={PiggyBank}
                        supportingText="Across all savings targets"
                    />
                    <OverviewCard
                        title="Saved this month"
                        amount={185_000}
                        icon={Target}
                        supportingText="Added in the current month"
                    />
                    <OverviewCard
                        title="Spent this month"
                        amount={268_500}
                        icon={CircleDollarSign}
                        supportingText="From all budget categories"
                    />
                    <OverviewCard
                        title="Remaining budget"
                        amount={431_500}
                        icon={WalletCards}
                        supportingText="Available for the rest of the month"
                    />
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
                        <ExpenseCard
                            expenseName="Market groceries"
                            amount={18_500}
                            category="Food & Groceries"
                            categoryBudget={150_000}
                            date="19 Oct 2026"
                            className="transition duration-300 hover:scale-102"
                        />
                        <ExpenseCard
                            expenseName="Uber ride"
                            amount={8_500}
                            category="Transportation"
                            categoryBudget={75_000}
                            date="18 Oct 2026"
                            className="transition duration-300 hover:scale-102"
                        />
                        <ExpenseCard
                            expenseName="Data subscription"
                            amount={12_000}
                            category="Utilities"
                            categoryBudget={80_000}
                            date="17 Oct 2026"
                            className="transition duration-300 hover:scale-102"
                        />
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
                        <SavingsGoalCard
                            title="Trip to Senegal!"
                            targetAmount={2_000_000}
                            savedAmount={1_123_000}
                            className="hover:scale-102 transition duration-300"
                        /> 

                        <SavingsGoalCard
                            title="Hyundai Tucson"
                            targetAmount={5_000_000}
                            savedAmount={4_600_000}
                            className="hover:scale-102 transition duration-300"
                        /> 
                        <SavingsGoalCard
                            title="House Rent"
                            targetAmount={2_000_000}
                            savedAmount={800_000}
                            className="hover:scale-102 transition duration-300"
                        /> 

                        <SavingsGoalCard
                            title="Emergency Funds"
                            targetAmount={5_000_000}
                            savedAmount={4_600_000}
                            className="hover:scale-102 transition duration-300"
                        />        
                    </div>

                    
                </div>


            </div>
            
        </Layout>
    )
}
