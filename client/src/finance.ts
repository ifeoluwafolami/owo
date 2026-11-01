export interface BudgetCategory {
    _id: string;
    name: string;
    monthlyLimit: number;
}

export interface Expense {
    _id: string;
    name: string;
    amount: number;
    occurredAt: string;
    category: BudgetCategory;
}

export interface SavingsGoal {
    _id: string;
    title: string;
    targetAmount: number;
    savedAmount: number;
    targetDate: string;
}

export interface SavingsContribution {
    _id: string;
    amount: number;
    contributedAt: string;
    goal: { _id: string; title: string };
}

export const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export function localDateValue() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
