import { Schema, model, Types, InferSchemaType } from "mongoose";
import { maxLength } from "zod";

const sessionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        refreshTokenHash: {
            type: String,
            required: true,
            select: false,
        },
        usedRefreshTokenHashes: {
            type: [String],
            default: [],
            select: false,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        absoluteExpiresAt: {
            type: Date,
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
        userAgent: {
            type: String,
            maxLength: 500,
        },
        ipAddress: {
            type: String,
            maxLength: 45,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

sessionSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export type SessionDocument = InferSchemaType<typeof sessionSchema>;
export const SessionModel = model("Session", sessionSchema);