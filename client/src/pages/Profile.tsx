import { useCallback, useState, type FormEvent } from "react";
import { CheckCircle2, LockKeyhole, Mail, User } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Modal from "../components/Modal";
import CalendarInput from "../components/CalendarInput";
import appData from "../data/appData.json";
import { USER_BIRTHDAY_KEY } from "../settingsStorage";

const inputClasses = "h-12 w-full rounded-xl border border-blue/20 bg-white/50 px-4 text-blue outline-none transition placeholder:text-blue/40 focus:border-blue focus:ring-2 focus:ring-blue/15";
const accountCreationDate = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
}).format(new Date(`${appData.user.accountCreatedAt}T00:00:00Z`));
const birthdayFormatter = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

export default function Profile() {
    const [profile, setProfile] = useState({
        firstName: appData.user.firstName,
        lastName: appData.user.lastName,
        email: appData.user.email,
        birthday: localStorage.getItem(USER_BIRTHDAY_KEY) ?? appData.user.birthday,
    });
    const [profileDraft, setProfileDraft] = useState(profile);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState(profile.email);
    const [isResetLinkSent, setIsResetLinkSent] = useState(false);

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const closeEdit = useCallback(() => setIsEditOpen(false), []);
    const closePassword = useCallback(() => setIsPasswordOpen(false), []);

    const openEdit = () => {
        setProfileDraft(profile);
        setIsEditOpen(true);
    };

    const openPassword = () => {
        setResetEmail(profile.email);
        setIsResetLinkSent(false);
        setIsPasswordOpen(true);
    };

    const handleSaveProfile = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProfile({
            firstName: profileDraft.firstName.trim(),
            lastName: profileDraft.lastName.trim(),
            email: profileDraft.email.trim(),
            birthday: profileDraft.birthday,
        });
        localStorage.setItem(USER_BIRTHDAY_KEY, profileDraft.birthday);
        closeEdit();
    };

    const handlePasswordReset = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsResetLinkSent(true);
    };

    return (
        <Layout showHeader={true}>
            <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
                <div className="mb-8">
                    <p className="font-ferrite text-xs uppercase tracking-wide">ALL ABOUT YOU.</p>
                    <h1 className="mt-2 text-3xl tracking-wide">Your Profile</h1>
                </div>
                <div className="mx-auto w-full max-w-4xl">
                    

                    <section className="overflow-hidden rounded-3xl bg-light-blue text-blue shadow-xl">
                        <div className="flex flex-col items-center bg-blue/10 px-6 py-10 text-center">
                            <span className="grid size-40 place-items-center rounded-full border-4 border-blue bg-blue text-light-blue">
                                <User className="size-20" aria-hidden="true" />
                            </span>
                            <h2 className="mt-5 text-3xl font-semibold tracking-wide">{fullName}</h2>
                            <p className="mt-2 font-ferrite text-xs uppercase tracking-[0.2em] text-blue/60">
                                Joined <span className="font-medium">{accountCreationDate}</span>
                            </p>
                        </div>

                        <div className="p-6 sm:p-8">
                            <h3 className="font-ferrite text-sm uppercase tracking-wider">Personal details</h3>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl bg-blue/10 p-4">
                                    <p className="text-xs uppercase tracking-widest text-blue/50">First name</p>
                                    <p className="mt-2 text-lg font-semibold">{profile.firstName}</p>
                                </div>
                                <div className="rounded-2xl bg-blue/10 p-4">
                                    <p className="text-xs uppercase tracking-widest text-blue/50">Last name</p>
                                    <p className="mt-2 text-lg font-semibold">{profile.lastName}</p>
                                </div>
                                <div className="rounded-2xl bg-blue/10 p-4">
                                    <p className="text-xs uppercase tracking-widest text-blue/50">Email address</p>
                                    <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                                        <Mail className="size-5 text-blue/55" aria-hidden="true" />
                                        {profile.email}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-blue/10 p-4">
                                    <p className="text-xs uppercase tracking-widest text-blue/50">Birthday</p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {birthdayFormatter.format(new Date(`${profile.birthday}T00:00:00Z`))}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-7 grid gap-3 sm:grid-cols-2">
                                <Button label="Edit Personal Details" variant="dark" onClick={openEdit} />
                                <button
                                    type="button"
                                    onClick={openPassword}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-blue/25 px-6 font-space-grotesk uppercase tracking-widest text-blue transition hover:bg-blue/10"
                                >
                                    <LockKeyhole className="size-5" aria-hidden="true" />
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Modal isOpen={isEditOpen} onClose={closeEdit} title="Edit Personal Details">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            First name
                            <input
                                type="text"
                                value={profileDraft.firstName}
                                onChange={(event) => setProfileDraft((draft) => ({ ...draft, firstName: event.target.value }))}
                                className={inputClasses}
                                autoComplete="given-name"
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Last name
                            <input
                                type="text"
                                value={profileDraft.lastName}
                                onChange={(event) => setProfileDraft((draft) => ({ ...draft, lastName: event.target.value }))}
                                className={inputClasses}
                                autoComplete="family-name"
                                required
                            />
                        </label>
                    </div>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        Email address
                        <input
                            type="email"
                            value={profileDraft.email}
                            onChange={(event) => setProfileDraft((draft) => ({ ...draft, email: event.target.value }))}
                            className={inputClasses}
                            autoComplete="email"
                            required
                        />
                    </label>
                    <div className="flex flex-col gap-2 text-sm font-semibold">
                        <span>Birthday</span>
                        <CalendarInput
                            mode="single"
                            value={profileDraft.birthday}
                            onChange={(birthday) => setProfileDraft((draft) => ({ ...draft, birthday }))}
                            placeholder="Select birthday"
                        />
                    </div>
                    <Button type="submit" label="Save Details" variant="dark" className="w-full" />
                </form>
            </Modal>

            <Modal
                isOpen={isPasswordOpen}
                onClose={closePassword}
                title={isResetLinkSent ? "Check Your Inbox" : "Change Password"}
            >
                {isResetLinkSent ? (
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto size-14 text-blue" aria-hidden="true" />
                        <p className="mt-5 leading-relaxed text-blue/70">
                            We’ve sent a password reset link to <strong className="text-blue">{resetEmail}</strong>. Check your inbox to continue.
                        </p>
                        <Button label="Done" variant="dark" className="mt-6 w-full" onClick={closePassword} />
                    </div>
                ) : (
                    <form onSubmit={handlePasswordReset}>
                        <p className="mb-5 leading-relaxed text-blue/70">
                            Confirm the email connected to your account and we’ll send you a link to reset your password.
                        </p>
                        <label className="flex flex-col gap-2 text-sm font-semibold">
                            Email address
                            <input
                                type="email"
                                value={resetEmail}
                                className={`${inputClasses} cursor-default bg-blue/10 text-blue/70 focus:border-blue/20 focus:ring-0`}
                                autoComplete="email"
                                readOnly
                                required
                            />
                        </label>
                        <Button type="submit" label="Confirm Email" variant="dark" className="mt-6 w-full" />
                    </form>
                )}
            </Modal>
        </Layout>
    );
}
