import { z } from "zod";

const preferencesSchema = z.object({
    currency: z.enum(["NGN", "USD", "GBP", "EUR", "GHS"]),
    overspendingThreshold: z.number().min(0).max(100),
    emailNotifications: z.boolean(),
    inAppNotifications: z.boolean(),
    theme: z.enum(["ocean", "monochroma", "rose", "amethyst"]),
});

export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    birthday: z.iso.date().optional(),
    monthlyIncome: z.number().min(0).optional(),
    preferences: preferencesSchema.partial().optional(),
}). refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;