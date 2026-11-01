import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    CLIENT_ORIGIN: z.url("CLIENT_ORIGIN must be a valid URL").default("http://localhost:5173"),

    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_SECURE: z
        .enum(["true", "false"]).
        transform((value) => value === "true"),
    SMTP_USER: z.string().min(1, "SMTP_USER is required"),
    SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),

    EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
    APP_URL: z.url("APP_URL must be a valid URL"),

    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),

    JWT_ACCESS_EXPIRY: z.string().default("15m"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment configuration:");
    console.error(z.prettifyError(result.error));

    throw new Error("Application configuration is invalid");
}

const env = result.data;

export const config = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    mongodb: {
        uri: env.MONGODB_URI
    },
    clientOrigin: env.CLIENT_ORIGIN,
    email: {
        smtpHost: env.SMTP_HOST,
        smtpPort: env.SMTP_PORT,
        smtpSecure: env.SMTP_SECURE,
        smtpUser: env.SMTP_USER,
        smtpPass: env.SMTP_PASS,
        from: env.EMAIL_FROM,
        appUrl: env.APP_URL,
    },
    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        accessExpiry: env.JWT_ACCESS_EXPIRY
    }
    
} as const;
