import Layout from "../components/Layout";
import Button from "../components/Button";
import SavingsGoalCard from "../components/SavingsGoalCard";
import ExpenseCard from "../components/ExpenseCard";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const featuredSavingsGoal = { title: "Emergency Fund", targetAmount: 500000, savedAmount: 185000, targetDate: "2027-06-01" };
const featuredExpense = { expenseName: "Market groceries", amount: 18500, category: "Food & Groceries", categoryBudget: 150000 };

export default function Homepage() {
    const [stopBounce, setStopBounce] = useState(false);
    const [expensesReplay, setExpensesReplay] = useState(0);
    useEffect(() => {
        if (!stopBounce) return;

        const timeout = setTimeout(() => {
            setStopBounce(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [stopBounce]);

    const handleGetStarted = () => {
        setStopBounce(true);
        document.getElementById("how-it-works")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <Layout showHeader={false}>
            <div className="relative z-100 min-h-screen overflow-hidden">
                {/* <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 bg-light-blue/30 blur-2xl"
                /> */}

                <header className="fixed left-0 top-0 z-200 flex h-20 w-full items-center justify-between py-4 px-8">
                    <div></div>
                    <div className="flex gap-4">
                        <Link to="/login">
                            <Button label="Login" variant="light" />
                        </Link>

                        <Link to="/signup">
                            <Button label="Sign up" variant="dark" />
                        </Link>
                        
                        
                    </div>
                </header> 

                <main className="relative z-10 flex flex-col items-center">
                    {/* Hero */}
                    <section className="flex h-screen w-full shrink-0 flex-col items-center justify-center gap-8">
                        <h1 className="text-9xl font-ferrite">OWO</h1>
                        <Button
                            label="Get Started"
                            variant="dark"
                            className={stopBounce ? "" : "animate-bounce"}
                            onClick={handleGetStarted}
                        />
                    </section>

                    {/* How it works */}
                    <section id="how-it-works" className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
                        <h1 className="text-4xl uppercase">Money talks. <span className="font-ferrite text-blue text-5xl">OWO</span> listens.</h1>
                        <p className="text-xl tracking-wide mb-8">Keep track of your spending, crush your savings goals and ensure every naira is accounted for.</p>

                        <div className="flex gap-20 h-[60vh] justify-center items-center">
                            <div
                                className="flex h-full w-[30vw] flex-col items-center justify-between rounded-2xl bg-blue p-8 shadow-2xl shadow-blue transition-transform duration-300 hover:scale-[1.03]"
                            >
                                <div className="flex flex-col gap-2 text-center">
                                    <h3 className="text-4xl font-ferrite uppercase tracking-widest font-medium">Savings</h3>
                                    <p className="uppercase tracking-wider">Give your money a mission.</p>
                                </div>
                                
                                <SavingsGoalCard
                                    title={featuredSavingsGoal.title}
                                    targetAmount={featuredSavingsGoal.targetAmount}
                                    savedAmount={featuredSavingsGoal.savedAmount}
                                    targetDate={featuredSavingsGoal.targetDate}
                                />
                                
                                <p className="text-center">Saving up for rent, an emergency fund, a new phone or a vacation? Crush your saving targets with OWO!</p>
                                
                            </div>

                            <div
                                className="flex h-full w-[30vw] flex-col items-center justify-between rounded-2xl bg-blue p-8 shadow-2xl shadow-blue transition-transform duration-300 hover:scale-[1.03]"
                                onMouseEnter={() => setExpensesReplay((value) => value + 1)}
                            >
                                <div className="flex flex-col gap-2 text-center">
                                    <h3 className="text-4xl font-ferrite uppercase tracking-widest font-medium">EXPENSES</h3>
                                    <p className="uppercase tracking-wider">Account for what you spend.</p>
                                </div>
                                
                                <ExpenseCard
                                    expenseName={featuredExpense.expenseName}
                                    amount={featuredExpense.amount}
                                    category={featuredExpense.category}
                                    categoryBudget={featuredExpense.categoryBudget}
                                    replaySignal={expensesReplay}
                                    className="w-[85%]"
                                />
                                
                                <p className="text-center">Log every expense and always know exactly how much you have left to spend.</p>
                                
                            </div>
                        </div>
                    </section>

                </main>

            </div>
        </Layout>
    )
}
