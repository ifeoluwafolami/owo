export interface PublicUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthday?: string;
    monthlyIncome?: number;

    preferences: {
        currency: "NGN" | "USD" | "GBP" | "EUR" | "GHS";
        overspendingThreshold: number;
        emailNotifications: boolean;
        inAppNotifications: boolean;
        theme: "ocean" | "monochroma" | "rose" | "amethyst";
    };

    onboardingCompleted: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}