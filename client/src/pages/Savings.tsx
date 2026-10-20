import { useCallback, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, History } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Modal from "../components/Modal";
import SavingsGoalCard from "../components/SavingsGoalCard";
import CalendarInput from "../components/CalendarInput";
import MoneyInput from "../components/MoneyInput";
import appData from "../data/appData.json";

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

export default function Savings() {
    const [goals, setGoals] = useState(appData.savingsGoals);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
    const [useDateRange, setUseDateRange] = useState(false);
    const [rangeStart, setRangeStart] = useState("2026-10-01");
    const [rangeEnd, setRangeEnd] = useState("2026-10-19");
    const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", targetDate: "" });
    const closeHistory = useCallback(() => setIsHistoryOpen(false), []);
    const closeNewGoal = useCallback(() => setIsNewGoalOpen(false), []);

    const totalSaved = goals.reduce((total, goal) => total + goal.savedAmount, 0);
    const totalTarget = goals.reduce((total, goal) => total + goal.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;
    const historyMonth = appData.savingsHistory[0]?.date.slice(0, 7) ?? "";
    const savedThisMonth = appData.savingsHistory
        .filter((entry) => entry.date.startsWith(historyMonth))
        .reduce((total, entry) => total + entry.amount, 0);

    const filteredHistory = useMemo(() => {
        if (!useDateRange) return appData.savingsHistory;

        return appData.savingsHistory.filter((entry) => {
            const afterStart = !rangeStart || entry.date >= rangeStart;
            const beforeEnd = !rangeEnd || entry.date <= rangeEnd;
            return afterStart && beforeEnd;
        });
    }, [rangeEnd, rangeStart, useDateRange]);

    const rangeTotal = filteredHistory.reduce((total, entry) => total + entry.amount, 0);

    const handleCreateGoal = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const targetAmount = Number(newGoal.targetAmount);
        if (!newGoal.title.trim() || targetAmount <= 0 || !newGoal.targetDate) return;

        setGoals((currentGoals) => [
            ...currentGoals,
            {
                id: `goal-${Date.now()}`,
                title: newGoal.title.trim(),
                targetAmount,
                savedAmount: 0,
                targetDate: newGoal.targetDate,
            },
        ]);
        setNewGoal({ title: "", targetAmount: "", targetDate: "" });
        closeNewGoal();
    };

    return (
        <Layout showHeader={true}>
            <div className="relative z-100 min-h-screen overflow-hidden px-16 py-12">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex justify-between items-end w-full">
                        <div className="flex flex-col gap-3">
                            <p className="font-ferrite text-xs uppercase tracking-wide">SAVE, ON PURPOSE.</p>
                            <h1 className="text-3xl tracking-wide">Savings</h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsHistoryOpen(true)}
                            aria-label="View savings history"
                            title="Savings history"
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-light-blue px-4 font-space-grotesk text-sm font-semibold uppercase tracking-wide text-blue shadow-md transition duration-200 hover:scale-105 hover:bg-light-blue/80"
                        >
                            <History className="size-5" />
                            <span>View History</span>
                        </button>
                    </div>
                </div>

                <section className="rounded-2xl bg-blue/20 p-4" aria-label="Overall savings progress">
                    <div className="rounded-2xl bg-light-blue p-6 text-blue shadow-lg">
                        <div className="mb-5 flex items-end justify-between gap-6">
                            <div>
                                <p className="font-ferrite text-sm uppercase tracking-wider">Overall savings</p>
                                <p className="mt-2 text-3xl font-bold tracking-wider">
                                    {currencyFormatter.format(totalSaved)}
                                </p>
                                <p className="mt-1 text-sm text-blue/60">
                                    saved out of {currencyFormatter.format(totalTarget)}
                                </p>
                            </div>
                            <span className="rounded-full bg-blue px-3 py-1 text-sm font-semibold text-light-blue">
                                {overallProgress.toFixed(0)}%
                            </span>
                        </div>
                        <div
                            className="h-4 overflow-hidden rounded-full bg-blue/15"
                            role="progressbar"
                            aria-label="Total savings progress"
                            aria-valuemin={0}
                            aria-valuemax={totalTarget}
                            aria-valuenow={totalSaved}
                        >
                            <div
                                className="h-full rounded-full bg-blue"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-12 flex flex-col gap-6">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="font-ferrite text-xs uppercase tracking-wide">Money on a mission.</p>
                            <h2 className="text-3xl tracking-wide">Your Savings Targets</h2>
                        </div>
                        <Button label="New Savings Goal" onClick={() => setIsNewGoalOpen(true)} />
                    </div>

                    <div className="grid grid-cols-2 gap-6 rounded-2xl bg-blue/20 p-4">
                        {goals.map((goal) => (
                            <SavingsGoalCard
                                key={goal.id}
                                title={goal.title}
                                targetAmount={goal.targetAmount}
                                savedAmount={goal.savedAmount}
                                targetDate={goal.targetDate}
                                animate={false}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <Modal
                isOpen={isHistoryOpen}
                onClose={closeHistory}
                title="Savings History"
                size="large"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-blue p-5 text-light-blue flex flex-col justify-center">
                        <p className="text-xs uppercase tracking-widest">Saved this month</p>
                        <p className="mt-2 text-2xl font-bold tracking-wider">{currencyFormatter.format(savedThisMonth)}</p>
                    </div>
                    <div className="rounded-2xl bg-blue/10 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-widest text-blue/60">Saved vs target</p>
                            <span className="font-semibold">{overallProgress.toFixed(0)}%</span>
                        </div>
                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-blue/15">
                            <div className="h-full rounded-full bg-blue" style={{ width: `${overallProgress}%` }} />
                        </div>
                        <p className="mt-2 text-sm text-blue/60">
                            {currencyFormatter.format(totalSaved)} of {currencyFormatter.format(totalTarget)}
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

                <div className="mt-6 flex items-center justify-between">
                    <h3 className="font-ferrite uppercase tracking-wide">Savings added</h3>
                    <p className="font-semibold bg-blue text-light-blue p-2 tracking-wider uppercase">Total: {currencyFormatter.format(rangeTotal)}</p>
                </div>

                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between gap-4 rounded-xl bg-blue/10 px-4 py-3">
                                <div>
                                    <p className="font-semibold">{entry.goalTitle}</p>
                                    <p className="mt-1 text-sm text-blue/60">{dateFormatter.format(new Date(entry.date))}</p>
                                </div>
                                <p className="font-bold tracking-wider">+{currencyFormatter.format(entry.amount)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="rounded-xl bg-blue/10 p-5 text-center text-blue/60">No savings were added in this range.</p>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isNewGoalOpen}
                onClose={closeNewGoal}
                title="Create Savings Goal"
            >
                <form onSubmit={handleCreateGoal} className="space-y-5">
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        Title
                        <input
                            type="text"
                            value={newGoal.title}
                            onChange={(event) => setNewGoal((goal) => ({ ...goal, title: event.target.value }))}
                            placeholder="e.g. New laptop"
                            required
                            className="h-12 rounded-xl border border-blue/20 bg-white/50 px-4 outline-none transition placeholder:text-blue/35 focus:border-blue"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        Target amount
                        <MoneyInput
                            value={newGoal.targetAmount}
                            onValueChange={(targetAmount) => setNewGoal((goal) => ({ ...goal, targetAmount }))}
                            placeholder="0"
                            required
                        />
                    </label>
                    <div className="flex flex-col gap-2 text-sm font-semibold">
                        <span>Target date</span>
                        <CalendarInput
                            mode="single"
                            value={newGoal.targetDate}
                            onChange={(targetDate) => setNewGoal((goal) => ({ ...goal, targetDate }))}
                            placeholder="Select target date"
                        />
                    </div>
                    <Button type="submit" label="Create Goal" className="w-full" variant="dark" />
                </form>
            </Modal>
        </Layout>
    );
}
