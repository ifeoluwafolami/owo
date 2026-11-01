import assert from "node:assert/strict";
import test from "node:test";
import { updateProfileSchema } from "../validators/users.validators.js";

test("profile updates accept partial preference changes", () => {
    assert.equal(updateProfileSchema.safeParse({
        firstName: "Ada",
        preferences: { currency: "USD" },
    }).success, true);
});

test("profile updates reject invalid or empty payloads", () => {
    assert.equal(updateProfileSchema.safeParse({ birthday: "2026-15-45" }).success, false);
    assert.equal(updateProfileSchema.safeParse({ monthlyIncome: -500 }).success, false);
    assert.equal(updateProfileSchema.safeParse({}).success, false);
});
