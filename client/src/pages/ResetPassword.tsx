import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import ResetPasswordImage from "../assets/reset-password.jpg";
import Button from "../components/Button";
import Layout from "../components/Layout";

const inputClasses = "h-12 w-full rounded-xl border border-blue/20 bg-white/55 px-4 text-blue outline-none transition placeholder:text-blue/45 focus:border-blue focus:ring-2 focus:ring-blue/15";

export default function ResetPassword() {
    const [error, setError] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setError("");
        setIsComplete(true);
    };

    return (
        <Layout>
            <div className="flex h-screen overflow-hidden">
                <div
                    className="hidden h-full flex-1 bg-cover bg-center bg-no-repeat lg:block"
                    style={{ backgroundImage: `url(${ResetPasswordImage})` }}
                    aria-hidden="true"
                />

                <div className="relative h-full flex-1 overflow-hidden">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-light-blue/45 blur-2xl" />

                    <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-10">
                        <div className="w-full max-w-lg text-blue">
                            <Link to="/" className="block text-center font-ferrite text-4xl tracking-widest">OWO</Link>

                            {isComplete ? (
                                <div className="mt-10 text-center">
                                    {/* <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue text-2xl text-light-blue">✓</div> */}
                                    <h1 className="mt-5 text-xl font-semibold uppercase">Password changed successfully</h1>
                                    <p className="mt-3 w-full">Your password has been reset. Kindly login to your account.</p>
                                    <Link to="/login" className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue px-8 font-ferrite uppercase text-light-blue transition hover:bg-blue/80">
                                        Return to login
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-10">
                                    <div className="mb-8 text-center">
                                        <h1 className="text-3xl font-semibold">Reset your password</h1>
                                        <p className="mt-2 text-blue/65">Choose a strong new password for your account.</p>
                                    </div>

                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <label className="block space-y-1.5 text-sm font-semibold">
                                            <span>New password</span>
                                            <input className={inputClasses} type="password" name="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required />
                                        </label>
                                        <label className="block space-y-1.5 text-sm font-semibold">
                                            <span>Confirm new password</span>
                                            <input className={inputClasses} type="password" name="confirmPassword" autoComplete="new-password" minLength={8} placeholder="Enter your password again" required />
                                        </label>

                                        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}

                                        <Button type="submit" label="Reset password" variant="dark" className="w-full" />
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
