import { Resend } from "resend";

import { config } from "../config/config.js";

const resend = new Resend(config.email.resendApiKey);

function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
    })[character] ?? character);
}

export async function sendVerificationEmail(
    email: string,
    token: string,
    firstName: string
): Promise<void> {
    const verificationUrl = new URL("/verify-email", config.email.appUrl);
    verificationUrl.searchParams.set("token", token);

    const safeFirstName = escapeHtml(firstName);
    const url = verificationUrl.toString();
    const { error } = await resend.emails.send({
        from: config.email.from,
        to: email,
        subject: "Verify your OWO account",
        text: `Hello ${firstName},\n\nWelcome to OWO! Verify your email address by visiting this link:\n\n${url}\n\nThis link expires in 24 hours.\n\nIf you didn't create an OWO account, you can ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #101b49;">
                <h2>Welcome to OWO, ${safeFirstName}!</h2>
                <p>Please verify your email address. You can continue using OWO while you do this.</p>
                <p>
                    <a href="${url}" style="display:inline-block;padding:12px 20px;background:#101b49;color:#fff;text-decoration:none;border-radius:8px;">
                        Verify my email
                    </a>
                </p>
                <p>This link expires in 24 hours.</p>
                <p>If you didn't create an OWO account, you can ignore this email.</p>
            </div>
        `,
    });

    if (error) {
        throw new Error(`Resend rejected the verification email: ${error.message}`);
    }
}
