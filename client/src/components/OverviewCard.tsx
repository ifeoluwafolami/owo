import type { LucideIcon } from "lucide-react";

interface OverviewCardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    supportingText: string;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
});

export default function OverviewCard({
    title,
    amount,
    icon: Icon,
    supportingText,
}: OverviewCardProps) {
    return (
        <article className="group flex min-h-44 flex-col justify-between rounded-2xl bg-light-blue p-6 text-blue shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center justify-between gap-4">
                <h2 className="font-ferrite text-sm font-medium uppercase tracking-wider">{title}</h2>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue text-light-blue transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
            </div>

            <div>
                <p className="text-3xl font-bold tracking-wider">{currencyFormatter.format(amount)}</p>
                <p className="mt-2 text-sm text-blue/60">{supportingText}</p>
            </div>
        </article>
    );
}
