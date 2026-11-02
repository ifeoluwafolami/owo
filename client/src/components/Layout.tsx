import { Eye, EyeOff, LayoutDashboard, LogOut, Menu, PiggyBank, ReceiptText, Settings, User, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useToast } from "./Toast";
import { usePrivacy } from "../privacy";

interface LayoutProps {
    children: ReactNode;
    showHeader?: boolean;
}

const navigationItems = [
    { label: "Overview", path: "/overview", icon: LayoutDashboard },
    { label: "Savings", path: "/savings", icon: PiggyBank },
    { label: "Spending", path: "/spending", icon: ReceiptText },
];

const mobileNavigationItems = [
    ...navigationItems,
    { label: "Profile", path: "/profile", icon: UserRound },
    { label: "Settings", path: "/settings", icon: Settings },
];

export default function Layout ({ children, showHeader = false }: LayoutProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const toast = useToast();
    const { amountsVisible, toggleAmounts } = usePrivacy();
    const { pathname } = useLocation();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isProfileMenuOpen) return;



        const handlePointerDown = (event: PointerEvent) => {
            if (!profileMenuRef.current?.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsProfileMenuOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isProfileMenuOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsMobileMenuOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        await logout();
        toast.success("You have been logged out.");
        navigate("/login");
    };

    return (
        <div className="relative min-h-screen w-full bg-blue">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 bg-light-blue/30 blur-2xl"
            />
            {showHeader && (
                <>
                    <header className="fixed inset-x-0 top-0 z-400 flex h-16 items-center justify-between border-b border-light-blue/15 bg-blue px-5 text-light-blue shadow-xl lg:hidden">
                        <Link to="/overview" onClick={() => setIsMobileMenuOpen(false)} className="font-ferrite text-2xl font-medium tracking-widest">
                            OWO
                        </Link>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={toggleAmounts} aria-label={amountsVisible ? "Hide all amounts" : "Show all amounts"} aria-pressed={amountsVisible} title={amountsVisible ? "Hide all amounts" : "Show all amounts"} className="grid size-11 place-items-center rounded-xl border border-light-blue/25 transition hover:bg-light-blue hover:text-blue">
                                {amountsVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                            <button
                                type="button"
                                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-navigation"
                                onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
                                className="grid size-11 place-items-center rounded-xl border border-light-blue/25 transition hover:bg-light-blue hover:text-blue"
                            >
                                {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                        </div>
                    </header>

                    {isMobileMenuOpen && (
                        <div
                            className="fixed inset-0 top-16 z-350 bg-blue/55 p-3 backdrop-blur-sm lg:hidden"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) setIsMobileMenuOpen(false);
                            }}
                        >
                            <nav id="mobile-navigation" aria-label="Mobile navigation" className="ml-auto w-full max-w-sm rounded-3xl bg-light-blue p-4 text-blue shadow-2xl">
                                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-blue/10 p-3">
                                    <span className="grid size-10 place-items-center rounded-full bg-blue text-light-blue">
                                        <User className="size-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{user ? `${user.firstName} ${user.lastName}` : "Your account"}</p>
                                        <p className="truncate text-xs text-blue/60">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {mobileNavigationItems.map(({ label, path, icon: Icon }) => {
                                        const isActive = pathname === path || pathname.startsWith(`${path}/`);
                                        return <button
                                            key={path}
                                            type="button"
                                            aria-current={isActive ? "page" : undefined}
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                navigate(path);
                                            }}
                                            className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left font-ferrite font-medium uppercase tracking-widest transition ${isActive ? "bg-blue text-light-blue" : "hover:bg-blue/10"}`}
                                        >
                                            <Icon className="size-5 shrink-0" />
                                            {label}
                                        </button>;
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="mt-3 flex h-12 w-full items-center gap-3 rounded-xl border border-red-200 px-3 text-left font-ferrite font-medium uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                                >
                                    <LogOut className="size-5 shrink-0" />
                                    Log Out
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}

            {showHeader && (
                <aside
                    data-profile-open={isProfileMenuOpen}
                    className="group/sidebar fixed inset-y-0 left-0 z-300 hidden w-24 flex-col items-center border-r border-light-blue/15 bg-blue text-light-blue shadow-2xl transition-[width] duration-300 ease-out hover:w-64 focus-within:w-64 data-[profile-open=true]:w-64 lg:flex"
                >
                    <Link
                        to="/"
                        className="flex h-20 w-full shrink-0 items-center justify-center font-ferrite text-2xl font-medium tracking-widest transition-all duration-300 group-hover/sidebar:justify-start group-hover/sidebar:px-6 group-focus-within/sidebar:justify-start group-focus-within/sidebar:px-6 group-data-[profile-open=true]/sidebar:justify-start group-data-[profile-open=true]/sidebar:px-6"
                    >
                        OWO
                    </Link>

                    <nav aria-label="Main navigation" className="flex w-full flex-col items-center gap-6 px-3 py-6">
                        {navigationItems.map(({ label, path, icon: Icon }) => {
                            const isActive = pathname === path || pathname.startsWith(`${path}/`);

                            return (
                                <button
                                    key={path}
                                    type="button"
                                    aria-current={isActive ? "page" : undefined}
                                    onClick={() => navigate(path)}
                                    className={`group/tab flex h-12 w-full items-center justify-center gap-0 rounded-xl font-ferrite font-medium uppercase tracking-widest transition-all duration-200 group-hover/sidebar:justify-start group-hover/sidebar:gap-4 group-hover/sidebar:px-3 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-4 group-focus-within/sidebar:px-3 group-data-[profile-open=true]/sidebar:justify-start group-data-[profile-open=true]/sidebar:gap-4 group-data-[profile-open=true]/sidebar:px-3 ${isActive ? "group-hover/sidebar:bg-light-blue group-hover/sidebar:text-blue group-hover/sidebar:shadow-sm group-focus-within/sidebar:bg-light-blue group-focus-within/sidebar:text-blue group-focus-within/sidebar:shadow-sm group-data-[profile-open=true]/sidebar:bg-light-blue group-data-[profile-open=true]/sidebar:text-blue group-data-[profile-open=true]/sidebar:shadow-sm" : "hover:bg-light-blue/10 hover:text-light-blue hover:ring-1 hover:ring-inset hover:ring-light-blue/20"}`}
                                >
                                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-200 ${isActive ? "bg-light-blue text-blue shadow-sm group-hover/sidebar:bg-transparent group-hover/sidebar:shadow-none group-focus-within/sidebar:bg-transparent group-focus-within/sidebar:shadow-none group-data-[profile-open=true]/sidebar:bg-transparent group-data-[profile-open=true]/sidebar:shadow-none" : "group-hover/tab:scale-105"}`}>
                                        <Icon className="size-6" aria-hidden="true" />
                                    </span>
                                    <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover/sidebar:max-w-40 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-40 group-focus-within/sidebar:opacity-100 group-data-[profile-open=true]/sidebar:max-w-40 group-data-[profile-open=true]/sidebar:opacity-100">
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    <div ref={profileMenuRef} className="mt-auto flex w-full flex-col gap-2 px-3 pb-6">
                        <button
                            type="button"
                            onClick={toggleAmounts}
                            aria-label={amountsVisible ? "Hide all amounts" : "Show all amounts"}
                            aria-pressed={amountsVisible}
                            title={amountsVisible ? "Hide all amounts" : "Show all amounts"}
                            className="group/privacy flex h-12 w-full items-center justify-center gap-0 rounded-xl transition-all duration-200 hover:bg-light-blue hover:text-blue group-hover/sidebar:justify-start group-hover/sidebar:gap-4 group-hover/sidebar:px-3 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-4 group-focus-within/sidebar:px-3 group-data-[profile-open=true]/sidebar:justify-start group-data-[profile-open=true]/sidebar:gap-4 group-data-[profile-open=true]/sidebar:px-3"
                        >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl">
                                {amountsVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </span>
                            <span className="max-w-0 overflow-hidden whitespace-nowrap font-ferrite text-sm font-medium uppercase tracking-widest opacity-0 transition-all duration-200 group-hover/sidebar:max-w-40 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-40 group-focus-within/sidebar:opacity-100 group-data-[profile-open=true]/sidebar:max-w-40 group-data-[profile-open=true]/sidebar:opacity-100">
                                {amountsVisible ? "Hide amounts" : "Show amounts"}
                            </span>
                        </button>
                        <div
                            role="menu"
                            aria-hidden={!isProfileMenuOpen}
                            className={`flex flex-col gap-2 overflow-hidden transition-all duration-200 ${isProfileMenuOpen ? "max-h-44 opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
                        >
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleLogout}
                                className="flex h-11 w-full items-center justify-start gap-4 rounded-xl px-3 text-left font-ferrite font-medium uppercase tracking-widest text-red-400 transition duration-200 hover:bg-red-800 hover:text-red-200"
                            >
                                <LogOut className="size-6 shrink-0" />
                                <span className="whitespace-nowrap">Log Out</span>
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setIsProfileMenuOpen(false)
                                    navigate("/settings")
                                }}
                                className="flex h-11 w-full items-center justify-start gap-4 rounded-xl px-3 text-left font-ferrite font-medium uppercase tracking-widest transition duration-200 hover:bg-light-blue hover:text-blue"
                            >
                                <Settings className="size-6 shrink-0" />
                                <span className="whitespace-nowrap">Settings</span>
                            </button>

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setIsProfileMenuOpen(false)
                                    navigate("/profile")
                                }}
                                className="flex h-11 w-full items-center justify-start gap-4 rounded-xl px-3 text-left font-ferrite font-medium uppercase tracking-widest transition duration-200 hover:bg-light-blue hover:text-blue"
                            >
                                <UserRound className="size-6 shrink-0" />
                                <span className="whitespace-nowrap">Profile</span>
                            </button>
                            
                            
                        </div>

                        <button
                            type="button"
                            aria-label="Toggle profile menu"
                            aria-haspopup="menu"
                            aria-expanded={isProfileMenuOpen}
                            onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                            className="group/profile flex h-12 w-full items-center justify-center gap-0 rounded-xl transition-all duration-200 hover:bg-light-blue hover:text-blue group-hover/sidebar:justify-start group-hover/sidebar:gap-4 group-hover/sidebar:px-2 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-4 group-focus-within/sidebar:px-2 group-data-[profile-open=true]/sidebar:justify-start group-data-[profile-open=true]/sidebar:gap-4 group-data-[profile-open=true]/sidebar:px-2"
                        >
                            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-light-blue bg-blue transition group-hover/profile:border-blue group-hover/profile:bg-transparent">
                                <User className="size-4" />
                            </span>
                            <span className="max-w-0 overflow-hidden whitespace-nowrap font-space-grotesk opacity-0 transition-all duration-200 group-hover/sidebar:max-w-40 group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-40 group-focus-within/sidebar:opacity-100 group-data-[profile-open=true]/sidebar:max-w-40 group-data-[profile-open=true]/sidebar:opacity-100">
                                {user ? `${user.firstName} ${user.lastName}` : "Profile"}
                            </span>
                        </button>
                    </div>
                </aside>
            )}
            

            <div className={`relative min-h-screen w-full font-space-grotesk text-light-blue ${showHeader ? "pt-16 lg:pl-24 lg:pt-0" : ""}`}>
                {children}
            </div>
            
            <footer className={`relative z-10 flex h-10 items-center justify-center bg-blue/20 font-ferrite text-lg font-medium uppercase tracking-widest text-light-blue ${showHeader ? "lg:pl-24" : ""}`}>
                <p>Made by HIF</p>
            </footer>
        </div>
    )
}
