import { useState, type FormEvent } from "react";
import { api } from "../api";
import { useAuth, type CurrentUser } from "../auth";
import Button from "../components/Button";
import Layout from "../components/Layout";

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [draft, setDraft] = useState({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        birthday: user?.birthday?.slice(0, 10) ?? "",
        monthlyIncome: String(user?.monthlyIncome ?? ""),
    });
    const [status, setStatus] = useState("");

    const save = async (event: FormEvent) => {
        event.preventDefault(); setStatus("");
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
            setStatus("Profile updated.");
        } catch (reason) { setStatus(reason instanceof Error ? reason.message : "Unable to update profile."); }
    };

    return <Layout showHeader><main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-3xl"><p className="font-ferrite text-xs uppercase">Your OWO identity.</p><h1 className="mt-2 text-3xl">Profile</h1><section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue shadow-xl sm:p-8">
        <div className="mb-6"><p className="text-lg font-semibold">{user?.email}</p><p className="text-sm text-blue/60">Verified account</p></div>
        {status && <p role="status" className="mb-5 rounded-xl bg-blue/10 p-3">{status}</p>}
        <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">First name<input className="mt-2 h-12 w-full rounded-xl border px-4" value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} required /></label>
            <label className="text-sm font-semibold">Last name<input className="mt-2 h-12 w-full rounded-xl border px-4" value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} required /></label>
            <label className="text-sm font-semibold">Birthday<input type="date" className="mt-2 h-12 w-full rounded-xl border px-4" value={draft.birthday} onChange={(e) => setDraft({ ...draft, birthday: e.target.value })} /></label>
            <label className="text-sm font-semibold">Monthly income<input type="number" min="0" step="1" className="mt-2 h-12 w-full rounded-xl border px-4" value={draft.monthlyIncome} onChange={(e) => setDraft({ ...draft, monthlyIncome: e.target.value })} /></label>
            <Button type="submit" label="Save Profile" variant="dark" className="sm:col-span-2" />
        </form>
    </section></div></main></Layout>;
}
