import "dotenv/config";

import { sendVerificationEmail } from "../services/email.service.js";

async function testEmail(): Promise<void> {
  try {
    await sendVerificationEmail(
      "test@example.com",
      "abc123456789",
      "Ada"
    );

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}

void testEmail();