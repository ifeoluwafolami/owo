import { History, PiggyBank } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import MoneyInput from "../components/MoneyInput";
import SavingsGoalCard from "../components/SavingsGoalCard";
import { currencyFormatter, localDateValue, type SavingsContribution, type SavingsGoal } from "../finance";

export default function Savings() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [history, setHistory] = useState<SavingsContribution[]>([]);
    const [modal, setModal] = useState<"goal" | "contribution" | "history" | null>(null);
    const [selectedGoal, setSelectedGoal] = useState("");
    const [goalDraft, setGoalDraft] = useState({ title: "", targetAmount: "", targetDate: "" });
    const [contributionDraft, setContributionDraft] = useState({ amount: "", contributedAt: localDateValue() });
    const [error, setError] = useState("");

    useEffect(() => {
        void Promise.all([
            api<{ goals: SavingsGoal[] }>("/savings/goals"),
            api<{ contributions: SavingsContribution[] }>("/savings/contributions?limit=100"),
        ]).then(([goalResult, historyResult]) => {
            setGoals(goalResult.goals);
            setHistory(historyResult.contributions);
            setSelectedGoal((current) => current || goalResult.goals[0]?._id || "");
        }).catch((reason: Error) => setError(reason.message));
    }, []);

    const createGoal = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ goal: SavingsGoal }>("/savings/goals", { method: "POST", body: JSON.stringify({ ...goalDraft, targetAmount: Number(goalDraft.targetAmount) }) });
            setGoals((items) => [result.goal, ...items]);
            setSelectedGoal(result.goal._id);
            setGoalDraft({ title: "", targetAmount: "", targetDate: "" });
            setModal(null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create goal."); }
    };

    const addContribution = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ contribution: SavingsContribution; goal: SavingsGoal }>(`/savings/goals/${selectedGoal}/contributions`, { method: "POST", body: JSON.stringify({ ...contributionDraft, amount: Number(contributionDraft.amount) }) });
            setHistory((items) => [result.contribution, ...items]);
            setGoals((items) => items.map((goal) => goal._id === result.goal._id ? result.goal : goal));
            setContributionDraft({ amount: "", contributedAt: localDateValue() });
            setModal(null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to add contribution."); }
    };

    const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const progress = totalTarget ? Math.min(100, totalSaved / totalTarget * 100) : 0;

    return <Layout showHeader><main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-ferrite text-xs uppercase">Save, on purpose.</p><h1 className="mt-2 text-3xl">Savings</h1></div><div className="flex gap-3"><Button label="Add Savings" onClick={() => setModal("contribution")} disabled={!goals.length} /><Button label="New Goal" onClick={() => setModal("goal")} /></div></div>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-100 p-4 text-red-800">{error}</p>}
        <section className="mt-6 rounded-2xl bg-light-blue p-6 text-blue"><div className="flex items-end justify-between"><div><p className="font-ferrite uppercase">Overall savings</p><p className="mt-2 text-3xl font-bold">{currencyFormatter.format(totalSaved)}</p><p className="text-sm text-blue/60">of {currencyFormatter.format(totalTarget)}</p></div><span className="rounded-full bg-blue px-3 py-1 text-light-blue">{progress.toFixed(0)}%</span></div><div className="mt-5 h-4 overflow-hidden rounded-full bg-blue/15"><div className="h-full rounded-full bg-blue" style={{ width: `${progress}%` }} /></div></section>
        <section className="mt-10"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-2xl">Your Savings Targets</h2><Button label="History" onClick={() => setModal("history")} /></div><div className="grid gap-6 md:grid-cols-2">{goals.map((goal) => <SavingsGoalCard key={goal._id} title={goal.title} targetAmount={goal.targetAmount} savedAmount={goal.savedAmount} targetDate={goal.targetDate} animate={false} />)}{!goals.length && <EmptyState icon={PiggyBank} title="Start your first savings goal" description="Set a target and build toward it." actionLabel="New Goal" onAction={() => setModal("goal")} className="md:col-span-2" />}</div></section>
    </main>
    <Modal isOpen={modal === "goal"} onClose={() => setModal(null)} title="Create Savings Goal"><form onSubmit={createGoal} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Goal title" value={goalDraft.title} onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })} required /><MoneyInput value={goalDraft.targetAmount} onValueChange={(targetAmount) => setGoalDraft({ ...goalDraft, targetAmount })} placeholder="Target amount" required /><input type="date" className="h-12 w-full rounded-xl border px-4" value={goalDraft.targetDate} onChange={(e) => setGoalDraft({ ...goalDraft, targetDate: e.target.value })} required /><Button type="submit" label="Create Goal" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "contribution"} onClose={() => setModal(null)} title="Add Savings"><form onSubmit={addContribution} className="space-y-4"><select className="h-12 w-full rounded-xl border px-4" value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} required>{goals.map((goal) => <option key={goal._id} value={goal._id}>{goal.title}</option>)}</select><MoneyInput value={contributionDraft.amount} onValueChange={(amount) => setContributionDraft({ ...contributionDraft, amount })} placeholder="Amount" required /><input type="date" className="h-12 w-full rounded-xl border px-4" value={contributionDraft.contributedAt} onChange={(e) => setContributionDraft({ ...contributionDraft, contributedAt: e.target.value })} required /><Button type="submit" label="Add Contribution" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "history"} onClose={() => setModal(null)} title="Savings History" size="large"><div className="max-h-96 space-y-2 overflow-y-auto">{history.map((entry) => <div key={entry._id} className="flex items-center justify-between rounded-xl bg-blue/10 p-4"><div><p className="font-semibold">{entry.goal.title}</p><p className="text-sm text-blue/60">{new Date(entry.contributedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div><p className="font-bold">+{currencyFormatter.format(entry.amount)}</p></div>)}{!history.length && <EmptyState icon={History} title="No savings history" description="Contributions will appear here." />}</div></Modal>
    </Layout>;
}
