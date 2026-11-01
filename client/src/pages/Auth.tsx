import { useCallback, useState, type FormEvent } from "react";
import Button from "../components/Button";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import LoginImage from "../assets/login.jpg";
import SignupImage from "../assets/signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Onboarding from "../components/Onboarding";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth";

type AuthMode = "login" | "signup";

interface AuthProps {
    initialMode?: AuthMode;
}

const inputClasses = "h-12 w-full rounded-xl border border-blue/20 bg-white/55 px-4 text-blue outline-none transition placeholder:text-blue/45 focus:border-blue focus:ring-2 focus:ring-blue/15";

function GoogleIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="block h-5 w-5" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.29-2.66l-3.57-2.77c-.99.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.58 10.58 0 0 0 12 1a11 11 0 0 0-9.82 6.07L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="block h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35-.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z" />
        </svg>
    );
}

export default function Auth({ initialMode = "login" }: AuthProps) {
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [isResetLinkSent, setIsResetLinkSent] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const isSignup = mode === "signup";

    const selectMode = (nextMode: AuthMode) => {
        setMode(nextMode);
        setStatus("");
        navigate(nextMode === "login" ? "/login" : "/signup", { replace: true });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus("");
        const data = new FormData(event.currentTarget);
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");
        const confirmPassword = String(data.get("confirmPassword") ?? "");
        if (isSignup && password !== confirmPassword) {
            setStatus("The passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            if (isSignup) {
                const message = await signup({
                    firstName: String(data.get("firstName") ?? ""),
                    lastName: String(data.get("lastName") ?? ""),
                    email,
                    password,
                });
                setStatus(message);
                event.currentTarget.reset();
            } else {
                const user = await login(email, password);
                if (user.onboardingCompleted) navigate("/overview");
                else setIsOnboardingOpen(true);
            }
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Unable to authenticate.");
        } finally {
            setSubmitting(false);
        }
    };

    const closeForgotPassword = useCallback(() => {
        setIsForgotPasswordOpen(false);
    }, []);

    const handleForgotPassword = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsResetLinkSent(true);
    };

    return (
        <Layout>
            <div className="flex h-screen overflow-hidden">
                <div className="relative hidden h-full flex-1 overflow-hidden lg:block" aria-hidden="true">
                    <div
                        className={`absolute inset-0 bg-cover bg-left bg-no-repeat transition-opacity duration-700 ease-in-out ${isSignup ? "opacity-0" : "opacity-100"}`}
                        style={{ backgroundImage: `url(${LoginImage})` }}
                    />
                    <div
                        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${isSignup ? "opacity-100" : "opacity-0"}`}
                        style={{ backgroundImage: `url(${SignupImage})` }}
                    />
                </div>

                <div className="relative h-full flex-1 overflow-x-hidden overflow-y-auto">
                    {/* <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 bg-light-blue/45 blur-2xl"
                    /> */}

                    <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-10 sm:px-10">
                        <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -18 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="flex h-full w-full max-w-md flex-col justify-between text-blue"
                        >
                            <div className="flex flex-col">
                                <Link to="/">
                                    <p className="mb-4 text-center font-ferrite text-4xl tracking-widest">OWO</p>
                                </Link>
                                

                                <div className="mb-7 grid grid-cols-2 rounded-2xl bg-blue/10 p-1" aria-label="Authentication mode">
                                    <button
                                        type="button"
                                        aria-pressed={mode === "login"}
                                        onClick={() => selectMode("login")}
                                        className={`h-11 rounded-xl font-ferrite uppercase transition-all duration-300 ${mode === "login" ? "bg-blue text-light-blue shadow-md" : "text-blue/60 hover:bg-blue/50 hover:text-light-blue"}`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        aria-pressed={mode === "signup"}
                                        onClick={() => selectMode("signup")}
                                        className={`h-11 rounded-xl font-ferrite uppercase transition-all duration-300 ${mode === "signup" ? "bg-blue text-light-blue shadow-md" : "text-blue/60 hover:bg-blue/50 hover:text-light-blue"}`}
                                    >
                                        Sign up
                                    </button>
                                </div>    
                            </div>
                            
                            <div className="flex flex-col">
                                <div className="mb-6 text-center">
                                    {/* <h1 className="text-3xl font-semibold">
                                        {isSignup ? "Create your account" : "Welcome back"}
                                    </h1> */}
                                    <p className="mt-2 text-lg uppercase tracking-wider text-blue/65">
                                        {isSignup ? "Start making every naira count." : "Manage your money wisely."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        disabled
                                        title="Google sign-in is not available yet"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue/20 bg-white/45 font-semibold leading-none transition hover:bg-white/70"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center"><GoogleIcon /></span>
                                        <span className="flex h-5 items-center leading-none">Google</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled
                                        title="Apple sign-in is not available yet"
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue/20 bg-white/45 font-semibold leading-none transition hover:bg-white/70"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center"><AppleIcon /></span>
                                        <span className="flex h-5 items-center leading-none">Apple</span>
                                    </button>
                                </div>

                                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-blue/50">
                                    <span className="h-px flex-1 bg-blue/20" />
                                    <span>{isSignup ? "or fill in your details" : "or use your email"}</span>
                                    <span className="h-px flex-1 bg-blue/20" />
                                </div>

                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    {isSignup && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="space-y-1.5 text-sm font-semibold">
                                                <span>First name</span>
                                                <input className={inputClasses} name="firstName" autoComplete="given-name" placeholder="Ada" required />
                                            </label>
                                            <label className="space-y-1.5 text-sm font-semibold">
                                                <span>Last name</span>
                                                <input className={inputClasses} name="lastName" autoComplete="family-name" placeholder="Okafor" required />
                                            </label>
                                        </div>
                                    )}

                                    <label className="block space-y-1.5 text-sm font-semibold">
                                        <span>Email</span>
                                        <input className={inputClasses} type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
                                    </label>

                                    <label className="block space-y-1.5 text-sm font-semibold">
                                        <span>Password</span>
                                        <div className="relative">
                                            <input className={`${inputClasses} pr-12`} type={showPassword ? "text" : "password"} name="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder="Enter your password" required />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((visible) => !visible)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                aria-pressed={showPassword}
                                                className="absolute inset-y-0 right-0 grid w-12 place-items-center text-blue/55 transition hover:text-blue"
                                            >
                                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                            </button>
                                        </div>
                                    </label>

                                    {!isSignup && (
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsResetLinkSent(false);
                                                    setIsForgotPasswordOpen(true);
                                                }}
                                                className="text-sm font-semibold text-blue underline-offset-4 uppercase transition hover:scale-102 cursor-pointer hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    {isSignup && (
                                        <label className="block space-y-1.5 text-sm font-semibold">
                                            <span>Confirm password</span>
                                            <div className="relative">
                                                <input className={`${inputClasses} pr-12`} type={showConfirmPassword ? "text" : "password"} name="confirmPassword" autoComplete="new-password" placeholder="Enter your password again" required />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                                                    aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                                                    aria-pressed={showConfirmPassword}
                                                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-blue/55 transition hover:text-blue"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                        </label>
                                    )}

                                    {status && <p role="status" className={`rounded-xl p-3 text-sm ${status.toLowerCase().includes("created") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{status}</p>}

                                    <Button
                                        type="submit"
                                        label={submitting ? "Please wait…" : isSignup ? "Create account" : "Login"}
                                        variant="dark"
                                        className="mt-2 w-full"
                                        disabled={submitting}
                                    />
                                </form>
                            </div>
                            
                        </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isForgotPasswordOpen}
                onClose={closeForgotPassword}
                title={isResetLinkSent ? "Check your inbox" : "Forgot password?"}
            >
                {isResetLinkSent ? (
                    <div>
                        <p className="leading-relaxed text-blue/70">
                            Password recovery is not enabled on this v1 server yet. Contact support if you are locked out of <strong className="text-blue">{resetEmail}</strong>.
                        </p>
                        <Button label="Done" variant="dark" className="mt-6 w-full" onClick={closeForgotPassword} />
                    </div>
                ) : (
                    <form onSubmit={handleForgotPassword}>
                        <p className="mb-5 leading-relaxed text-blue/70">
                            Enter the email connected to your account and we will send you a link to reset your password.
                        </p>
                        <label className="block space-y-1.5 text-sm font-semibold">
                            <span>Email</span>
                            <input
                                className={inputClasses}
                                type="email"
                                name="resetEmail"
                                autoComplete="email"
                                value={resetEmail}
                                onChange={(event) => setResetEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </label>
                        <Button type="submit" label="Send reset link" variant="dark" className="mt-6 w-full" />
                    </form>
                )}
            </Modal>

            <Onboarding
                isOpen={isOnboardingOpen}
                onComplete={() => {
                    setIsOnboardingOpen(false);
                    navigate("/overview");
                }}
            />
        </Layout>
    );
}
