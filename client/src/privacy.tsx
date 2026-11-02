import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface PrivacyContextValue {
    amountsVisible: boolean;
    privacyVersion: number;
    toggleAmounts(): void;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: { children: ReactNode }) {
    const [amountsVisible, setAmountsVisible] = useState(false);
    const [privacyVersion, setPrivacyVersion] = useState(0);
    const value = useMemo(() => ({
        amountsVisible,
        privacyVersion,
        toggleAmounts: () => {
            setAmountsVisible((visible) => !visible);
            setPrivacyVersion((version) => version + 1);
        },
    }), [amountsVisible, privacyVersion]);

    return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrivacy() {
    const context = useContext(PrivacyContext);
    if (!context) throw new Error("usePrivacy must be used within PrivacyProvider");
    return context;
}
