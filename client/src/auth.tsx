import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, refreshAccessToken, setAccessToken } from "./api";
import { applyTheme } from "./theme";

export interface UserPreferences {
    currency: "NGN" | "USD" | "GBP" | "EUR" | "GHS";
    overspendingThreshold: number;
    emailNotifications: boolean;
    inAppNotifications: boolean;
    theme: "ocean" | "monochroma" | "rose" | "amethyst";
}

export interface CurrentUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthday?: string;
    monthlyIncome?: number;
    preferences: UserPreferences;
    onboardingCompleted: boolean;
    emailVerified: boolean;
    createdAt: string;
}

interface AuthContextValue {
    user: CurrentUser | null;
    loading: boolean;
    login(email: string, password: string): Promise<CurrentUser>;
    signup(input: { firstName: string; lastName: string; email: string; password: string }): Promise<string>;
    logout(): Promise<void>;
    reloadUser(): Promise<CurrentUser>;
    updateUser(user: CurrentUser): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    const reloadUser = async () => {
        const result = await api<{ user: CurrentUser }>("/auth/me");
        setUser(result.user);
        applyTheme(result.user.preferences.theme);
        return result.user;
    };

    useEffect(() => {
        void (async () => {
            const token = await refreshAccessToken();
            if (token) await reloadUser().catch(() => setUser(null));
            setLoading(false);
        })();
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        loading,
        async login(email, password) {
            const result = await api<{ accessToken: string }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            }, false);
            setAccessToken(result.accessToken);
            return reloadUser();
        },
        async signup(input) {
            const result = await api<{ message: string }>("/auth/signup", {
                method: "POST",
                body: JSON.stringify(input),
            }, false);
            return result.message;
        },
        async logout() {
            await api("/auth/logout", { method: "POST" }).catch(() => undefined);
            setAccessToken(null);
            setUser(null);
        },
        reloadUser,
        updateUser: setUser,
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
