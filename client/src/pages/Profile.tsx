import { useState, type FormEvent } from "react";
import { api } from "../api";
import { useAuth, type CurrentUser } from "../auth";
import Button from "../components/Button";
import CalendarInput from "../components/CalendarInput";
import Layout from "../components/Layout";
import MoneyInput from "../components/MoneyInput";
import { useToast } from "../components/Toast";

export default function Profile() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const [draft, setDraft] = useState({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        birthday: user?.birthday?.slice(0, 10) ?? "",
        monthlyIncome: String(user?.monthlyIncome ?? ""),
    });

    const save = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await api<{ user: CurrentUser }>("/users/me", {
                method: "PATCH",
                body: JSON.stringify({
                    firstName: draft.firstName,
                    lastName: draft.lastName,
                    ...(draft.birthday ? { birthday: draft.birthday } : {}),
                    ...(draft.monthlyIncome ? { monthlyIncome: Number(draft.monthlyIncome) } : {}),
                }),
            });
            updateUser(result.user);
            toast.success("Profile updated.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to update profile."); }
    };

    return <Layout showHeader><main className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12"><div className="mx-auto max-w-3xl"><p className="font-ferrite text-xs uppercase">Your OWO identity.</p><h1 className="mt-2 text-2xl sm:text-3xl">Profile</h1><section className="mt-6 rounded-2xl bg-light-blue p-4 text-blue shadow-xl sm:mt-7 sm:rounded-3xl sm:p-8">
        <div className="mb-5 min-w-0 sm:mb-6"><p className="break-all text-base font-semibold sm:text-lg">{user?.email}</p><p className="text-xs text-blue/60 sm:text-sm">{user?.emailVerified ? "Verified account" : "Email verification pending"}</p></div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <label className="text-sm font-semibold">First name<input className="mt-2 h-12 w-full rounded-xl border px-4" value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} required /></label>
            <label className="text-sm font-semibold">Last name<input className="mt-2 h-12 w-full rounded-xl border px-4" value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} required /></label>
            <label className="text-sm font-semibold">Birthday<span className="mt-2 block"><CalendarInput mode="single" value={draft.birthday} onChange={(birthday) => setDraft({ ...draft, birthday })} placeholder="Select your birthday" /></span></label>
            <label className="text-sm font-semibold">Monthly income<span className="mt-2 block"><MoneyInput value={draft.monthlyIncome} onValueChange={(monthlyIncome) => setDraft({ ...draft, monthlyIncome })} placeholder="Monthly income" /></span></label>
            <Button type="submit" label="Save Profile" variant="dark" className="w-full sm:col-span-2" />
        </form>
    </section></div></main></Layout>;
}
