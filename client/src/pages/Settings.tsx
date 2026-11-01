import { Bell, Check, Palette } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import { useAuth, type CurrentUser, type UserPreferences } from "../auth";
import Button from "../components/Button";
import Layout from "../components/Layout";
import { applyTheme, themes, type ThemeId } from "../theme";

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(user!.preferences);
    const [status, setStatus] = useState("");

    const update = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
        setPreferences((current) => ({ ...current, [key]: value }));
        if (key === "theme") applyTheme(value as ThemeId);
    };

    const save = async () => {
        setStatus("");
        try {
            const result = await api<{ user: CurrentUser }>("/users/me", {
                method: "PATCH",
                body: JSON.stringify({ preferences }),
            });
            updateUser(result.user);
            setStatus("Settings saved.");
        } catch (reason) { setStatus(reason instanceof Error ? reason.message : "Unable to save settings."); }
    };

    return <Layout showHeader><main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16"><div className="mx-auto max-w-5xl"><p className="font-ferrite text-xs uppercase">Make OWO work your way.</p><h1 className="mt-2 text-3xl">Settings</h1>
        {status && <p role="status" className="mt-5 rounded-xl bg-light-blue p-4 text-blue">{status}</p>}
        <section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue"><div className="flex items-center gap-2"><Palette className="size-5" /><h2 className="font-ferrite uppercase">Appearance</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{themes.map((theme) => <button key={theme.id} type="button" onClick={() => update("theme", theme.id)} className={`rounded-2xl border p-4 text-left ${preferences.theme === theme.id ? "border-blue bg-blue/10 ring-2" : "border-blue/15"}`}><span className="flex gap-2"><span className="size-7 rounded-full" style={{ background: theme.dark }} /><span className="size-7 rounded-full border" style={{ background: theme.light }} /></span><span className="mt-3 flex items-center justify-between font-semibold">{theme.name}{preferences.theme === theme.id && <Check className="size-4" />}</span></button>)}</div></section>
        <section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue"><h2 className="font-ferrite uppercase">Financial preferences</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Currency<select className="mt-2 h-12 w-full rounded-xl border px-4" value={preferences.currency} onChange={(e) => update("currency", e.target.value as UserPreferences["currency"])}>{["NGN", "USD", "GBP", "EUR", "GHS"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold">Overspending threshold (%)<input type="number" min="0" max="100" className="mt-2 h-12 w-full rounded-xl border px-4" value={preferences.overspendingThreshold} onChange={(e) => update("overspendingThreshold", Number(e.target.value))} /></label></div></section>
        <section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue"><div className="flex items-center gap-2"><Bell className="size-5" /><h2 className="font-ferrite uppercase">Notifications</h2></div><div className="mt-5 space-y-3">{(["emailNotifications", "inAppNotifications"] as const).map((key) => <label key={key} className="flex items-center justify-between rounded-xl bg-blue/5 p-4"><span>{key === "emailNotifications" ? "Email notifications" : "In-app notifications"}</span><input type="checkbox" className="size-5" checked={preferences[key]} onChange={(e) => update(key, e.target.checked)} /></label>)}</div></section>
        <Button label="Save Settings" variant="dark" className="mt-7 w-full" onClick={save} />
    </div></main></Layout>;
}
