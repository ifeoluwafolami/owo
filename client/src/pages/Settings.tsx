import { useCallback, useState, type CSSProperties } from "react";
import { Bell, Check, Database, Download, Mail, Palette, RotateCcw, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { applyTheme, DEFAULT_THEME, isThemeId, themes, THEME_STORAGE_KEY, type ThemeId } from "../theme";
import { ALL_DATA_RESET_KEY, EXPENSE_HISTORY_CLEARED_KEY, PREFERENCES_STORAGE_KEY } from "../settingsStorage";
import { useNavigate } from "react-router-dom";

interface Preferences {
    currency: string;
    overspendingThreshold: string;
    emailNotifications: boolean;
    inAppNotifications: boolean;
}

interface PendingPreference {
    key: "currency" | "overspendingThreshold";
    value: string;
}

const defaultPreferences: Preferences = {
    currency: "NGN",
    overspendingThreshold: "90",
    emailNotifications: true,
    inAppNotifications: true,
};

function loadPreferences(): Preferences {
    const storedPreferences = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!storedPreferences) return defaultPreferences;

    try {
        return { ...defaultPreferences, ...JSON.parse(storedPreferences) as Partial<Preferences> };
    } catch {
        return defaultPreferences;
    }
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-blue" : "bg-blue/20"}`}
        >
            <span className={`absolute top-1 grid size-5 place-items-center rounded-full bg-light-blue shadow transition-all ${checked ? "left-6" : "left-1"}`}>
                {checked && <Check className="size-3 text-blue" />}
            </span>
        </button>
    );
}

export default function Settings() {
    const navigate = useNavigate();
    const initialTheme = (() => {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeId(storedTheme) ? storedTheme : DEFAULT_THEME;
    })();
    const [selectedTheme, setSelectedTheme] = useState<ThemeId>(initialTheme);
    const [appliedTheme, setAppliedTheme] = useState<ThemeId>(initialTheme);
    const [preferences, setPreferences] = useState(loadPreferences);
    const [currencyDraft, setCurrencyDraft] = useState(preferences.currency);
    const [thresholdDraft, setThresholdDraft] = useState(preferences.overspendingThreshold);
    const [pendingPreference, setPendingPreference] = useState<PendingPreference | null>(null);
    const [pendingAction, setPendingAction] = useState<"reset" | "expenses" | null>(null);
    const [statusMessage, setStatusMessage] = useState("");

    const closeConfirmation = useCallback(() => setPendingAction(null), []);
    const closePreferenceConfirmation = useCallback(() => {
        setCurrencyDraft(preferences.currency);
        setThresholdDraft(preferences.overspendingThreshold);
        setPendingPreference(null);
    }, [preferences.currency, preferences.overspendingThreshold]);

    const selectedThemeDetails = themes.find((theme) => theme.id === selectedTheme) ?? themes[0];
    const previewThemeStyle = {
        "--color-blue": selectedThemeDetails.dark,
        "--color-light-blue": selectedThemeDetails.light,
    } as CSSProperties;

    const applySelectedTheme = () => {
        applyTheme(selectedTheme);
        setAppliedTheme(selectedTheme);
        setStatusMessage(`${selectedThemeDetails.name} is now your active colour scheme.`);
    };

    const returnToDefaultTheme = () => {
        setSelectedTheme(DEFAULT_THEME);
        setAppliedTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
        setStatusMessage("The default Ocean colour scheme has been restored.");
    };

    const updatePreferences = (changes: Partial<Preferences>) => {
        setPreferences((currentPreferences) => {
            const nextPreferences = { ...currentPreferences, ...changes };
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(nextPreferences));
            return nextPreferences;
        });
    };

    const confirmPreferenceChange = () => {
        if (!pendingPreference) return;

        updatePreferences({ [pendingPreference.key]: pendingPreference.value });
        setStatusMessage(
            pendingPreference.key === "currency"
                ? `Preferred currency changed to ${pendingPreference.value}.`
                : `Overspending alerts will appear at ${pendingPreference.value}%.`,
        );
        setPendingPreference(null);
    };

    const confirmDataAction = () => {
        if (pendingAction === "expenses") {
            localStorage.setItem(EXPENSE_HISTORY_CLEARED_KEY, "true");
            setStatusMessage("Expense history has been cleared.");
        }

        if (pendingAction === "reset") {
            localStorage.removeItem(PREFERENCES_STORAGE_KEY);
            localStorage.setItem(EXPENSE_HISTORY_CLEARED_KEY, "true");
            localStorage.setItem(ALL_DATA_RESET_KEY, "true");
            setPreferences(defaultPreferences);
            setCurrencyDraft(defaultPreferences.currency);
            setThresholdDraft(defaultPreferences.overspendingThreshold);
            setSelectedTheme(DEFAULT_THEME);
            setAppliedTheme(DEFAULT_THEME);
            applyTheme(DEFAULT_THEME);
            setStatusMessage("Tracker data and preferences have been reset.");
            closeConfirmation();
            navigate("/overview");
            return;
        }

        closeConfirmation();
    };

    return (
        <Layout showHeader={true}>
            <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
                <div className="mx-auto w-full max-w-6xl">
                    <div className="mb-8">
                        <p className="font-ferrite text-xs uppercase tracking-wide">Make OWO work your way.</p>
                        <h1 className="mt-2 text-3xl tracking-wide">Settings</h1>
                    </div>

                    {statusMessage && (
                        <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl bg-light-blue px-5 py-4 text-blue">
                            <Check className="size-5 shrink-0" />
                            <p className="font-semibold">{statusMessage}</p>
                        </div>
                    )}

                    <section className="rounded-3xl bg-light-blue p-6 text-blue shadow-xl sm:p-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <Palette className="size-5" />
                                <h2 className="font-ferrite text-lg uppercase tracking-wide">Appearance</h2>
                            </div>
                            <p className="mt-2 text-sm text-blue/60">Choose a colour scheme, preview it, then apply it to the tracker.</p>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {themes.map((theme) => {
                                const isSelected = theme.id === selectedTheme;
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => setSelectedTheme(theme.id)}
                                        aria-pressed={isSelected}
                                        className={`rounded-2xl border p-4 text-left transition ${isSelected ? "border-blue bg-blue/10 ring-2 ring-blue/15" : "border-blue/15 hover:bg-blue/5"}`}
                                    >
                                        <span className="flex gap-2">
                                            <span className="size-8 rounded-full border border-black/10" style={{ backgroundColor: theme.dark }} />
                                            <span className="size-8 rounded-full border border-black/10" style={{ backgroundColor: theme.light }} />
                                        </span>
                                        <span className="mt-4 flex items-center justify-between gap-2 font-semibold">
                                            {theme.name}
                                            {isSelected && <Check className="size-4" />}
                                        </span>
                                        <span className="mt-1 block text-sm text-blue/55">{theme.description}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-7">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue/55">Live overview preview</p>
                            <div className="overflow-hidden rounded-2xl bg-blue p-4 shadow-lg" style={previewThemeStyle}>
                                <div className="flex items-center justify-between text-light-blue">
                                    <div>
                                        <p className="font-ferrite text-[10px] uppercase tracking-widest opacity-70">Welcome back.</p>
                                        <p className="mt-1 text-lg font-semibold">Your money at a glance</p>
                                    </div>
                                    <span className="rounded-lg bg-light-blue px-3 py-2 text-xs font-semibold uppercase text-blue">Log expense</span>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {[
                                        ["Total saved", "₦1,123,000"],
                                        ["Saved this month", "₦185,000"],
                                        ["Spent this month", "₦268,500"],
                                        ["Budget remaining", "₦431,500"],
                                    ].map(([label, amount]) => (
                                        <div key={label} className="rounded-xl bg-light-blue p-3 text-blue">
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-blue/55">{label}</p>
                                            <p className="mt-3 text-sm font-bold tracking-wide">{amount}</p>
                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue/15">
                                                <div className="h-full w-2/3 rounded-full bg-blue" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={returnToDefaultTheme}
                                disabled={appliedTheme === DEFAULT_THEME && selectedTheme === DEFAULT_THEME}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-blue/20 px-5 text-sm font-semibold uppercase tracking-wide transition hover:bg-blue/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <RotateCcw className="size-4" />
                                Return to default
                            </button>
                            <Button
                                label="Select Scheme"
                                variant="dark"
                                onClick={applySelectedTheme}
                                disabled={selectedTheme === appliedTheme}
                                className="disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                            />
                        </div>
                    </section>

                    <section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue shadow-xl sm:p-8">
                        <h2 className="font-ferrite text-lg uppercase tracking-wide">Financial preferences</h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm font-semibold">
                                Preferred currency
                                <select
                                    value={currencyDraft}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setCurrencyDraft(value);
                                        if (value !== preferences.currency) {
                                            setPendingPreference({ key: "currency", value });
                                        }
                                    }}
                                    className="h-12 rounded-xl border border-blue/20 bg-white/50 px-4 outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
                                >
                                    <option value="NGN">Nigerian Naira (₦)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="GBP">British Pound (£)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="GHS">Ghanaian Cedi (GH₵)</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-semibold">
                                Overspending warning threshold
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={thresholdDraft}
                                        onChange={(event) => {
                                            const digits = event.target.value.replace(/\D/g, "");
                                            setThresholdDraft(digits ? String(Math.min(Number(digits), 100)) : "");
                                        }}
                                        onBlur={() => {
                                            if (thresholdDraft && thresholdDraft !== preferences.overspendingThreshold) {
                                                setPendingPreference({ key: "overspendingThreshold", value: thresholdDraft });
                                            } else if (!thresholdDraft) {
                                                setThresholdDraft(preferences.overspendingThreshold);
                                            }
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") event.currentTarget.blur();
                                        }}
                                        className="h-12 w-full rounded-xl border border-blue/20 bg-white/50 px-4 pr-10 outline-none focus:border-blue focus:ring-2 focus:ring-blue/15"
                                        aria-describedby="threshold-help"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold text-blue/55">%</span>
                                </div>
                                <span id="threshold-help" className="text-xs font-normal text-blue/50">Alert me when a category reaches this percentage.</span>
                            </label>
                        </div>
                    </section>

                    <section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue shadow-xl sm:p-8">
                        <div className="flex items-center gap-2">
                            <Bell className="size-5" />
                            <h2 className="font-ferrite text-lg uppercase tracking-wide">Notifications</h2>
                        </div>
                        <div className="mt-6 divide-y divide-blue/10 rounded-2xl bg-blue/5 px-5">
                            <div className="flex items-center justify-between gap-4 py-5">
                                <div className="flex items-center gap-3">
                                    <Mail className="size-5 text-blue/55" />
                                    <div>
                                        <p className="font-semibold">Email notifications</p>
                                        <p className="mt-1 text-sm text-blue/55">Receive budget and savings updates by email.</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={preferences.emailNotifications}
                                    onChange={() => updatePreferences({ emailNotifications: !preferences.emailNotifications })}
                                    label="Email notifications"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4 py-5">
                                <div className="flex items-center gap-3">
                                    <Bell className="size-5 text-blue/55" />
                                    <div>
                                        <p className="font-semibold">In-app notifications</p>
                                        <p className="mt-1 text-sm text-blue/55">Show alerts and reminders inside OWO.</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={preferences.inAppNotifications}
                                    onChange={() => updatePreferences({ inAppNotifications: !preferences.inAppNotifications })}
                                    label="In-app notifications"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="mt-7 rounded-3xl bg-light-blue p-6 text-blue shadow-xl sm:p-8">
                        <div className="flex items-center gap-2">
                            <Database className="size-5" />
                            <h2 className="font-ferrite text-lg uppercase tracking-wide">Data and privacy</h2>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <button
                                type="button"
                                onClick={() => setPendingAction("expenses")}
                                className="flex min-h-28 flex-col items-start justify-between rounded-2xl border border-blue/15 p-4 text-left transition hover:bg-blue/5"
                            >
                                <Trash2 className="size-5" />
                                <span>
                                    <span className="block font-semibold">Clear expense history</span>
                                    <span className="mt-1 block text-xs text-blue/55">Remove every recorded expense.</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                disabled
                                title="Export will be available soon"
                                className="flex min-h-28 cursor-not-allowed flex-col items-start justify-between rounded-2xl border border-blue/10 p-4 text-left opacity-40"
                            >
                                <Download className="size-5" />
                                <span>
                                    <span className="block font-semibold">Export financial data</span>
                                    <span className="mt-1 block text-xs">Coming soon.</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPendingAction("reset")}
                                className="flex min-h-28 flex-col items-start justify-between rounded-2xl border border-red-300 bg-red-50 p-4 text-left text-red-800 transition hover:bg-red-100"
                            >
                                <RotateCcw className="size-5" />
                                <span>
                                    <span className="block font-semibold">Reset all data</span>
                                    <span className="mt-1 block text-xs text-red-700/70">Erase tracker data and preferences.</span>
                                </span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            <Modal
                isOpen={pendingAction !== null}
                onClose={closeConfirmation}
                title={pendingAction === "reset" ? "Reset All Data?" : "Clear Expense History?"}
            >
                <p className="leading-relaxed text-blue/70">
                    {pendingAction === "reset"
                        ? "This will clear your tracker data, restore your financial preferences, and return the colour scheme to Ocean. This cannot be undone."
                        : "This will permanently remove all recorded expenses. Your budget categories will remain unchanged."}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button label="Cancel" onClick={closeConfirmation} />
                    <button
                        type="button"
                        onClick={confirmDataAction}
                        className="h-12 rounded-2xl bg-red-700 px-5 font-semibold uppercase tracking-widest text-white transition hover:bg-red-800"
                    >
                        Confirm
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={pendingPreference !== null}
                onClose={closePreferenceConfirmation}
                title="Confirm Preference Change"
            >
                <p className="leading-relaxed text-blue/70">
                    {pendingPreference?.key === "currency"
                        ? `Change your preferred currency from ${preferences.currency} to ${pendingPreference.value}?`
                        : `Change your overspending warning threshold from ${preferences.overspendingThreshold}% to ${pendingPreference?.value}%?`}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button label="Cancel" onClick={closePreferenceConfirmation} />
                    <Button label="Confirm" variant="dark" onClick={confirmPreferenceChange} />
                </div>
            </Modal>
        </Layout>
    );
}
