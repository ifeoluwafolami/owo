import { Bell, Check, Palette } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import { useAuth, type CurrentUser, type UserPreferences } from "../auth";
import Button from "../components/Button";
import Layout from "../components/Layout";
import { applyTheme, themes, type ThemeId } from "../theme";
import { useToast } from "../components/Toast";
import ToggleSwitch from "../components/ToggleSwitch";

export default function Settings() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(user!.preferences);

    const update = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
        setPreferences((current) => ({ ...current, [key]: value }));
        if (key === "theme") applyTheme(value as ThemeId);
    };

    const save = async () => {
        try {
            const result = await api<{ user: CurrentUser }>("/users/me", {
                method: "PATCH",
                body: JSON.stringify({ preferences }),
            });
            updateUser(result.user);
            toast.success("Settings saved.");
        } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to save settings."); }
    };

    return <Layout showHeader><main className="min-h-screen px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12"><div className="mx-auto max-w-5xl"><p className="font-ferrite text-xs uppercase">Make OWO work your way.</p><h1 className="mt-2 text-2xl sm:text-3xl">Settings</h1>
        <section className="mt-6 rounded-2xl bg-light-blue p-4 text-blue sm:mt-7 sm:rounded-3xl sm:p-6"><div className="flex items-center gap-2"><Palette className="size-5" /><h2 className="font-ferrite text-sm uppercase sm:text-base">Appearance</h2></div><div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-4">{themes.map((theme) => <button key={theme.id} type="button" onClick={() => update("theme", theme.id)} className={`min-w-0 rounded-2xl border p-3 text-left sm:p-4 ${preferences.theme === theme.id ? "border-blue bg-blue/10 ring-2" : "border-blue/15"}`}><span className="flex gap-1.5 sm:gap-2"><span className="size-6 rounded-full sm:size-7" style={{ background: theme.dark }} /><span className="size-6 rounded-full border sm:size-7" style={{ background: theme.light }} /></span><span className="mt-3 flex items-center justify-between gap-1 truncate text-sm font-semibold sm:text-base">{theme.name}{preferences.theme === theme.id && <Check className="size-4 shrink-0" />}</span></button>)}</div></section>
        <section className="mt-5 rounded-2xl bg-light-blue p-4 text-blue sm:mt-7 sm:rounded-3xl sm:p-6"><h2 className="font-ferrite text-sm uppercase sm:text-base">Financial preferences</h2><div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5"><label className="text-sm font-semibold">Currency<select className="mt-2 h-12 w-full rounded-xl border px-4" value={preferences.currency} onChange={(e) => update("currency", e.target.value as UserPreferences["currency"])}>{["NGN", "USD", "GBP", "EUR", "GHS"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold">Overspending threshold (%)<input type="number" min="0" max="100" className="mt-2 h-12 w-full rounded-xl border px-4" value={preferences.overspendingThreshold} onChange={(e) => update("overspendingThreshold", Number(e.target.value))} /></label></div></section>
        <section className="mt-5 rounded-2xl bg-light-blue p-4 text-blue sm:mt-7 sm:rounded-3xl sm:p-6"><div className="flex items-center gap-2"><Bell className="size-5" /><h2 className="font-ferrite text-sm uppercase sm:text-base">Notifications</h2></div><div className="mt-4 rounded-2xl bg-blue/10 px-4 sm:mt-5">{(["emailNotifications", "inAppNotifications"] as const).map((key) => { const label = key === "emailNotifications" ? "Email notifications" : "In-app notifications"; return <div key={key} className="flex items-center justify-between gap-3 border-b border-blue/10 py-4 last:border-0"><span className="flex items-center gap-2 text-sm font-semibold sm:text-base"><Bell className="size-4 shrink-0" />{label}</span><ToggleSwitch checked={preferences[key]} onChange={(checked) => update(key, checked)} label={label} /></div>; })}</div></section>
        <Button label="Save Settings" variant="dark" className="mt-7 w-full" onClick={save} />
    </div></main></Layout>;
}
