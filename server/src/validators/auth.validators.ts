import { z } from "zod";

export const signupSchema = z.object({
    firstName: z.string().trim()
    .min(2, "First name must contain at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

    lastName: z.string().trim()
    .min(2, "First name must contain at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

    email: z.email("Please provide a valid email address").max(254)
    .trim().transform((email) => email.toLowerCase()),

    password: z.string()
    .min(12, "Password must contain at least 12 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
    email: z.email("Please provide a valid email address").max(254).trim()
    .transform((email) => email.toLowerCase()),

    password: z.string().min(1, "Password is required")
})

export const verifyEmailSchema = z.object({
    token: z.string().length(64, "Invalid verification token")
    .regex(/^[a-f0-9]{64}$/i, "Invalid verification token"),
});

export const resendVerificationSchema = z.object({
    email: z.email("Please provide a valid email address").trim().max(254).transform((email) => email.toLowerCase()),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;