import assert from "node:assert/strict";
import test from "node:test";

test("access token contains the session identity and rejects tampering", async () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/owo-test";
    process.env.SMTP_HOST = "localhost";
    process.env.SMTP_PORT = "1025";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "test";
    process.env.SMTP_PASS = "test";
    process.env.EMAIL_FROM = "test@example.com";
    process.env.APP_URL = "http://localhost:5173";
    process.env.JWT_ACCESS_SECRET = "test-secret-that-is-not-used-outside-tests";

    const { generateAccessToken, verifyAccessToken } = await import("../utils/jwt.js");
    const token = generateAccessToken(
        "68f123456789abcdef123456",
        "user",
        "690abc123456789012345678"
    );
    const payload = verifyAccessToken(token);
    assert.equal(payload.sub, "68f123456789abcdef123456");
    assert.equal(payload.sid, "690abc123456789012345678");
    assert.throws(() => verifyAccessToken(`${token.slice(0, -1)}x`));
});
