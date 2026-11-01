import assert from "node:assert/strict";
import test from "node:test";
import { generateSecureToken, hashToken } from "../utils/token.js";

test("verification tokens have sufficient entropy and stable hashes", () => {
    const tokenA = generateSecureToken();
    const tokenB = generateSecureToken();
    assert.match(tokenA, /^[a-f0-9]{64}$/);
    assert.notEqual(tokenA, tokenB);
    assert.equal(hashToken(tokenA), hashToken(tokenA));
    assert.notEqual(hashToken(tokenA), hashToken(tokenB));
});
