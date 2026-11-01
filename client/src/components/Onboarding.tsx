import { useState, type FormEvent } from "react";
import { Bell, Check, Plus, X } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import CalendarInput from "./CalendarInput";
import MoneyInput from "./MoneyInput";
import { applyTheme, DEFAULT_THEME, themes, type ThemeId } from "../theme";
import { api } from "../api";
import { useAuth } from "../auth";

interface OnboardingProps {
    isOpen: boolean;
    onComplete: () => void;
}

interface BudgetDraft {
    id: string;
    name: string;
    budget: string;
}

interface SavingsDraft {
    id: string;
    title: string;
    targetAmount: string;
    targetDate: string;
}

const inputClasses = "h-12 w-full rounded-xl border border-blue/20 bg-white/50 px-4 text-blue outline-none placeholder:text-blue/40 focus:border-blue focus:ring-2 focus:ring-blue/15";

export default function Onboarding({ isOpen, onComplete }: OnboardingProps) {
    const { reloadUser } = useAuth();
    const [step, setStep] = useState(1);
    const [birthday, setBirthday] = useState("");
    const [monthlyIncome, setMonthlyIncome] = useState("");
    const [budgetCategories, setBudgetCategories] = useState<BudgetDraft[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsDraft[]>([]);
    const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
    const [currency, setCurrency] = useState("NGN");
    const [threshold, setThreshold] = useState("90");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [inAppNotifications, setInAppNotifications] = useState(true);

    const finishWithoutSaving = () => {
        void api("/users/me/onboarding", {
            method: "POST",
            body: JSON.stringify({ preferences: {} }),
        }).then(reloadUser).then(onComplete);
    };

    const finishOnboarding = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await api("/users/me/onboarding", {
            method: "POST",
            body: JSON.stringify({
                ...(birthday ? { birthday } : {}),
                ...(Number(monthlyIncome) > 0 ? { monthlyIncome: Number(monthlyIncome) } : {}),
                preferences: {
                    currency,
                    overspendingThreshold: Number(threshold || 90),
                    emailNotifications,
                    inAppNotifications,
                    theme,
                },
            }),
        });
        await Promise.all([
            ...budgetCategories
                .filter((category) => category.name.trim() && Number(category.budget) >= 0)
                .map((category) => api("/budgets", {
                    method: "POST",
                    body: JSON.stringify({ name: category.name.trim(), monthlyLimit: Number(category.budget) }),
                })),
            ...savingsGoals
                .filter((goal) => goal.title.trim() && Number(goal.targetAmount) > 0 && goal.targetDate)
                .map((goal) => api("/savings/goals", {
                    method: "POST",
                    body: JSON.stringify({ title: goal.title.trim(), targetAmount: Number(goal.targetAmount), targetDate: goal.targetDate }),
                })),
        ]);
        applyTheme(theme);
        await reloadUser();
        onComplete();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={finishWithoutSaving}
            title="Set Up Your OWO"
            size="large"
            mobileFullScreen
        >
            <div className="mb-7">
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className={`h-2 flex-1 rounded-full ${item <= step ? "bg-blue" : "bg-blue/15"}`} />
                    ))}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-blue/55">Step {step} of 3</p>
            </div>

            {step === 1 && (
                <div>
                    <h3 className="text-2xl font-semibold">When’s your birthday?</h3>
                    <p className="mt-2 text-blue/60">We’ll use it for birthday moments and age-appropriate financial insights.</p>
                    <div className="mt-7">
                        <CalendarInput
                            mode="single"
                            value={birthday}
                            onChange={setBirthday}
                            placeholder="Select your birthday"
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3 className="text-2xl font-semibold">Start with a simple plan</h3>
                    <p className="mt-2 text-blue/60">Add your monthly income, then create any budget categories or savings targets you already have in mind.</p>

                    <div className="mt-7 rounded-2xl bg-blue p-5 text-light-blue">
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Monthly income
                            <MoneyInput
                                value={monthlyIncome}
                                onValueChange={setMonthlyIncome}
                                placeholder="0"
                                aria-label="Monthly income"
                                className="border-light-blue/20 bg-light-blue text-blue"
                            />
                        </label>
                        <p className="mt-2 text-xs text-light-blue/70">You can update this later when reviewing your budget.</p>
                    </div>

                    <div className="mt-4 rounded-2xl bg-blue/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="font-ferrite uppercase tracking-wide">Budget categories</h4>
                            <button
                                type="button"
                                onClick={() => setBudgetCategories((items) => [...items, { id: `category-${Date.now()}`, name: "", budget: "" }])}
                                className="grid size-9 place-items-center rounded-full bg-blue text-light-blue"
                                aria-label="Add budget category"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-3">
                            {budgetCategories.length === 0 && <p className="text-sm text-blue/50">No categories added.</p>}
                            {budgetCategories.map((category) => (
                                <div key={category.id} className="grid grid-cols-[1fr_1fr_2.5rem] items-center gap-2">
                                    <input
                                        value={category.name}
                                        onChange={(event) => setBudgetCategories((items) => items.map((item) => item.id === category.id ? { ...item, name: event.target.value } : item))}
                                        placeholder="Category"
                                        aria-label="Category name"
                                        className={inputClasses}
                                    />
                                    <MoneyInput
                                        value={category.budget}
                                        onValueChange={(budget) => setBudgetCategories((items) => items.map((item) => item.id === category.id ? { ...item, budget } : item))}
                                        placeholder="Budget"
                                        aria-label="Category budget"
                                    />
                                    <button type="button" onClick={() => setBudgetCategories((items) => items.filter((item) => item.id !== category.id))} className="grid size-9 place-items-center rounded-xl hover:bg-red-100 hover:text-red-700" aria-label="Remove category">
                                        <X className="size-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-blue/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="font-ferrite uppercase tracking-wide">Savings targets</h4>
                            <button
                                type="button"
                                onClick={() => setSavingsGoals((items) => [...items, { id: `goal-${Date.now()}`, title: "", targetAmount: "", targetDate: "" }])}
                                className="grid size-9 place-items-center rounded-full bg-blue text-light-blue"
                                aria-label="Add savings target"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-3">
                            {savingsGoals.length === 0 && <p className="text-sm text-blue/50">No targets added.</p>}
                            {savingsGoals.map((goal) => (
                                <div key={goal.id} className="rounded-xl bg-white/30 p-3">
                                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_2.5rem]">
                                        <input
                                            value={goal.title}
                                            onChange={(event) => setSavingsGoals((items) => items.map((item) => item.id === goal.id ? { ...item, title: event.target.value } : item))}
                                            placeholder="Goal title"
                                            aria-label="Savings goal title"
                                            className={inputClasses}
                                        />
                                        <MoneyInput
                                            value={goal.targetAmount}
                                            onValueChange={(targetAmount) => setSavingsGoals((items) => items.map((item) => item.id === goal.id ? { ...item, targetAmount } : item))}
                                            placeholder="Target"
                                            aria-label="Savings target amount"
                                        />
                                        <button type="button" onClick={() => setSavingsGoals((items) => items.filter((item) => item.id !== goal.id))} className="grid size-9 place-items-center rounded-xl hover:bg-red-100 hover:text-red-700" aria-label="Remove savings target">
                                            <X className="size-5" />
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        <CalendarInput
                                            mode="single"
                                            value={goal.targetDate}
                                            onChange={(targetDate) => setSavingsGoals((items) => items.map((item) => item.id === goal.id ? { ...item, targetDate } : item))}
                                            placeholder="Target date"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={finishOnboarding}>
                    <h3 className="text-2xl font-semibold">Make it feel like yours</h3>
                    <p className="mt-2 text-blue/60">Choose your look and how OWO should keep you informed.</p>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {themes.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setTheme(item.id)}
                                className={`rounded-2xl border p-3 text-left ${theme === item.id ? "border-blue ring-2 ring-blue/15" : "border-blue/15"}`}
                            >
                                <span className="flex gap-1.5">
                                    <span className="size-7 rounded-full" style={{ backgroundColor: item.dark }} />
                                    <span className="size-7 rounded-full border border-black/10" style={{ backgroundColor: item.light }} />
                                </span>
                                <span className="mt-3 flex items-center justify-between text-sm font-semibold">{item.name}{theme === item.id && <Check className="size-4" />}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Preferred currency
                            <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputClasses}>
                                <option value="NGN">Nigerian Naira (₦)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="GBP">British Pound (£)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GHS">Ghanaian Cedi (GH₵)</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Overspending threshold
                            <div className="relative">
                                <input value={threshold} onChange={(event) => setThreshold(event.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" className={`${inputClasses} pr-10`} />
                                <span className="absolute inset-y-0 right-4 flex items-center text-blue/55">%</span>
                            </div>
                        </label>
                    </div>

                    <div className="mt-5 rounded-2xl bg-blue/10 px-4">
                        {[
                            { label: "Email notifications", value: emailNotifications, setValue: setEmailNotifications },
                            { label: "In-app notifications", value: inAppNotifications, setValue: setInAppNotifications },
                        ].map((notification) => (
                            <div key={notification.label} className="flex items-center justify-between border-b border-blue/10 py-4 last:border-0">
                                <span className="flex items-center gap-2 font-semibold"><Bell className="size-4" />{notification.label}</span>
                                <button type="button" role="switch" aria-checked={notification.value} onClick={() => notification.setValue(!notification.value)} className={`relative h-7 w-12 rounded-full ${notification.value ? "bg-blue" : "bg-blue/20"}`}>
                                    <span className={`absolute top-1 size-5 rounded-full bg-light-blue transition-all ${notification.value ? "left-6" : "left-1"}`} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <Button type="submit" label="Finish Setup" variant="dark" className="mt-7 w-full" />
                </form>
            )}

            {step < 3 && (
                <div className="mt-8 flex gap-3">
                    {step > 1 && <Button label="Back" onClick={() => setStep((current) => current - 1)} className="flex-1" />}
                    <Button
                        label={(step === 1 && !birthday) || (step === 2 && !monthlyIncome && budgetCategories.length === 0 && savingsGoals.length === 0) ? "Skip This Step" : "Continue"}
                        variant="dark"
                        onClick={() => setStep((current) => current + 1)}
                        className="flex-1"
                    />
                </div>
            )}

            <button type="button" onClick={finishWithoutSaving} className="mt-5 w-full text-center text-sm font-semibold uppercase tracking-wide text-blue/55 underline-offset-4 hover:underline">
                Skip onboarding totally
            </button>
        </Modal>
    );
}
