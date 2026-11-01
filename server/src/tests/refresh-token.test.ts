import assert from "node:assert/strict";
import test from "node:test";
import { generateRefreshToken, hashRefreshToken } from "../utils/refresh-token.js";

test("refresh tokens are random and only their deterministic hashes need storage", () => {
    const tokenA = generateRefreshToken();
    const tokenB = generateRefreshToken();
    assert.match(tokenA, /^[a-f0-9]{64}$/);
    assert.notEqual(tokenA, tokenB);
    assert.equal(hashRefreshToken(tokenA), hashRefreshToken(tokenA));
    assert.notEqual(hashRefreshToken(tokenA), hashRefreshToken(tokenB));
});
