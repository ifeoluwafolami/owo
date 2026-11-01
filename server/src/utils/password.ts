import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Password exceeds bcrypt's 72-byte limit");
    }
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
    if (Buffer.byteLength(password, "utf-8") > 72) {
        return false;
    }

    return bcrypt.compare(password, passwordHash);
}