import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    CLIENT_ORIGIN: z.url("CLIENT_ORIGIN must be a valid URL").default("http://localhost:5173"),

    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
    APP_URL: z.url("APP_URL must be a valid URL").optional(),

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
        resendApiKey: env.RESEND_API_KEY,
        from: env.EMAIL_FROM,
        appUrl: env.APP_URL ?? env.CLIENT_ORIGIN,
    },
    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        accessExpiry: env.JWT_ACCESS_EXPIRY
    }
    
} as const;
