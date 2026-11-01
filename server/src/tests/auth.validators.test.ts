import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema, signupSchema, verifyEmailSchema } from "../validators/auth.validators.js";

test("signup normalizes email and accepts a strong password", () => {
    const result = signupSchema.safeParse({
        firstName: "Ada",
        lastName: "Okafor",
        email: "ADA@EXAMPLE.COM",
        password: "SecurePassword123",
    });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.email, "ada@example.com");
});

test("signup rejects invalid fields and weak passwords", () => {
    assert.equal(signupSchema.safeParse({
        firstName: "A",
        lastName: "Okafor",
        email: "not-an-email",
        password: "weak",
    }).success, false);
});

test("login requires a password and verification token format is strict", () => {
    assert.equal(loginSchema.safeParse({ email: "ada@example.com", password: "" }).success, false);
    assert.equal(verifyEmailSchema.safeParse({ token: "nope" }).success, false);
    assert.equal(verifyEmailSchema.safeParse({ token: "a".repeat(64) }).success, true);
});
