import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface PrivacyContextValue {
    amountsVisible: boolean;
    toggleAmounts(): void;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

export function PrivacyProvider({ children }: { children: ReactNode }) {
    const [amountsVisible, setAmountsVisible] = useState(false);
    const value = useMemo(() => ({
        amountsVisible,
        toggleAmounts: () => setAmountsVisible((visible) => !visible),
    }), [amountsVisible]);

    return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrivacy() {
    const context = useContext(PrivacyContext);
    if (!context) throw new Error("usePrivacy must be used within PrivacyProvider");
    return context;
}
