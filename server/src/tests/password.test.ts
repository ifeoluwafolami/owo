import assert from "node:assert/strict";
import test from "node:test";
import { comparePassword, hashPassword } from "../utils/password.js";

test("password hashes are salted and verify only the correct password", async () => {
    const password = "SecurePassword123";
    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);
    assert.notEqual(firstHash, secondHash);
    assert.equal(await comparePassword(password, firstHash), true);
    assert.equal(await comparePassword("WrongPassword123", firstHash), false);
});

test("password comparison safely rejects input beyond bcrypt's byte limit", async () => {
    const hash = await hashPassword("SecurePassword123");
    assert.equal(await comparePassword("😀".repeat(19), hash), false);
});
