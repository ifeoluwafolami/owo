import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.email.smtpHost,
  port: config.email.smtpPort,
  secure: config.email.smtpSecure,
  auth: {
    user: config.email.smtpUser,
    pass: config.email.smtpPass,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
): Promise<void> {
  const verificationUrl = new URL(
    "/verify-email",
    config.email.appUrl
  );

  verificationUrl.searchParams.set("token", token);

  const info = await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: "Verify your Owo account",
    text: `
Hello ${firstName},

Welcome to Owo!

Please verify your email address by visiting this link:

${verificationUrl.toString()}

This link expires in 24 hours.

If you didn't create an owo account, you can ignore this email.
    `,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Owo, ${firstName}!</h2>

        <p>We are so glad you are here. Before you get started, please verify your email address.</p>

        <p>
          <a
            href="${verificationUrl.toString()}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #d946a8;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Verify my email
          </a>
        </p>

        <p>This link expires in 24 hours.</p>

        <p>If you didn't create an Owo account, you can ignore this email.</p>
      </div>
    `,
  });

  // Ethereal provides a browser preview of test emails.
  if (config.nodeEnv === "development") {
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log("Verification email preview:", previewUrl);
    }
  }
}