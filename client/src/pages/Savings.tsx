import { History, PiggyBank } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import Button from "../components/Button";
import CalendarInput from "../components/CalendarInput";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";
import MoneyInput from "../components/MoneyInput";
import PrivateAmount from "../components/PrivateAmount";
import SavingsGoalCard from "../components/SavingsGoalCard";
import { useToast } from "../components/Toast";
import { currencyFormatter, localDateValue, type SavingsContribution, type SavingsGoal } from "../finance";

export default function Savings() {
    const toast = useToast();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [history, setHistory] = useState<SavingsContribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState<"goal" | "contribution" | "history" | null>(null);
    const [selectedGoal, setSelectedGoal] = useState("");
    const [goalDraft, setGoalDraft] = useState({ title: "", targetAmount: "", targetDate: "" });
    const [contributionDraft, setContributionDraft] = useState({ amount: "", contributedAt: localDateValue() });

    useEffect(() => {
        void Promise.all([
            api<{ goals: SavingsGoal[] }>("/savings/goals"),
            api<{ contributions: SavingsContribution[] }>("/savings/contributions?limit=100"),
        ]).then(([goalResult, historyResult]) => {
            setGoals(goalResult.goals);
            setHistory(historyResult.contributions);
            setSelectedGoal((current) => current || goalResult.goals[0]?._id || "");
        }).catch((reason: Error) => toast.error(reason.message))
            .finally(() => setIsLoading(false));
    }, [toast]);

    const createGoal = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ goal: SavingsGoal }>("/savings/goals", { method: "POST", body: JSON.stringify({ ...goalDraft, targetAmount: Number(goalDraft.targetAmount) }) });
            setGoals((items) => [result.goal, ...items]);
            setSelectedGoal(result.goal._id);
            setGoalDraft({ title: "", targetAmount: "", targetDate: "" });
            setModal(null);
            toast.success("Savings goal created.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to create goal."); }
    };

    const addContribution = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ contribution: SavingsContribution; goal: SavingsGoal }>(`/savings/goals/${selectedGoal}/contributions`, { method: "POST", body: JSON.stringify({ ...contributionDraft, amount: Number(contributionDraft.amount) }) });
            setHistory((items) => [result.contribution, ...items]);
            setGoals((items) => items.map((goal) => goal._id === result.goal._id ? result.goal : goal));
            setContributionDraft({ amount: "", contributedAt: localDateValue() });
            setModal(null);
            toast.success("Savings contribution added.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to add contribution."); }
    };

    const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const progress = totalTarget ? Math.min(100, totalSaved / totalTarget * 100) : 0;

    return <Layout showHeader><main className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-ferrite text-xs uppercase">Save, on purpose.</p><h1 className="mt-2 text-2xl sm:text-3xl">Savings</h1></div><div className="grid grid-cols-2 gap-3 sm:flex"><Button label="Add Savings" className="w-full sm:w-auto" onClick={() => setModal("contribution")} disabled={!goals.length} /><Button label="New Goal" className="w-full sm:w-auto" onClick={() => setModal("goal")} /></div></div>
        {isLoading ? <LoadingState label="Loading your savings…" className="mt-6" /> : <><section className="mt-6 rounded-2xl bg-light-blue p-4 text-blue sm:p-6"><div className="flex items-end justify-between gap-3"><div className="min-w-0"><p className="font-ferrite text-sm uppercase sm:text-base">Overall savings</p><PrivateAmount value={currencyFormatter.format(totalSaved)} className="mt-2 text-2xl font-bold sm:text-3xl" /><div className="text-xs text-blue/60 sm:text-sm"><span>of </span><PrivateAmount value={currencyFormatter.format(totalTarget)} /></div></div><span className="shrink-0 rounded-full bg-blue px-3 py-1 text-sm text-light-blue">{progress.toFixed(0)}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-blue/15 sm:h-4"><div className="h-full rounded-full bg-blue" style={{ width: `${progress}%` }} /></div></section>
        <section className="mt-8 sm:mt-10"><div className="mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl sm:text-2xl">Your Savings Targets</h2><Button label="History" className="w-full sm:w-auto" onClick={() => setModal("history")} /></div><div className="grid gap-4 sm:gap-6 md:grid-cols-2">{goals.map((goal) => <SavingsGoalCard key={goal._id} title={goal.title} targetAmount={goal.targetAmount} savedAmount={goal.savedAmount} targetDate={goal.targetDate} animate={false} />)}{!goals.length && <EmptyState icon={PiggyBank} title="Start your first savings goal" description="Set a target and build toward it." actionLabel="New Goal" onAction={() => setModal("goal")} className="md:col-span-2" />}</div></section>
        </>}
    </main>
    <Modal isOpen={modal === "goal"} onClose={() => setModal(null)} title="Create Savings Goal"><form onSubmit={createGoal} className="space-y-4"><input className="h-12 w-full rounded-xl border px-4" placeholder="Goal title" value={goalDraft.title} onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })} required /><MoneyInput value={goalDraft.targetAmount} onValueChange={(targetAmount) => setGoalDraft({ ...goalDraft, targetAmount })} placeholder="Target amount" required /><CalendarInput mode="single" value={goalDraft.targetDate} onChange={(targetDate) => setGoalDraft({ ...goalDraft, targetDate })} placeholder="Select target date" /><Button type="submit" label="Create Goal" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "contribution"} onClose={() => setModal(null)} title="Add Savings"><form onSubmit={addContribution} className="space-y-4"><select className="h-12 w-full rounded-xl border px-4" value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)} required>{goals.map((goal) => <option key={goal._id} value={goal._id}>{goal.title}</option>)}</select><MoneyInput value={contributionDraft.amount} onValueChange={(amount) => setContributionDraft({ ...contributionDraft, amount })} placeholder="Amount" required /><CalendarInput mode="single" value={contributionDraft.contributedAt} onChange={(contributedAt) => setContributionDraft({ ...contributionDraft, contributedAt })} placeholder="Select contribution date" /><Button type="submit" label="Add Contribution" variant="dark" className="w-full" /></form></Modal>
    <Modal isOpen={modal === "history"} onClose={() => setModal(null)} title="Savings History" size="large"><div className="max-h-96 space-y-2 overflow-y-auto">{history.map((entry) => <div key={entry._id} className="flex items-start justify-between gap-3 rounded-xl bg-blue/10 p-3 sm:items-center sm:p-4"><div className="min-w-0"><p className="truncate font-semibold">{entry.goal.title}</p><p className="text-xs text-blue/60 sm:text-sm">{new Date(entry.contributedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div><PrivateAmount value={`+${currencyFormatter.format(entry.amount)}`} className="shrink-0 text-sm font-bold sm:text-base" /></div>)}{!history.length && <EmptyState icon={History} title="No savings history" description="Contributions will appear here." />}</div></Modal>
    </Layout>;
}
