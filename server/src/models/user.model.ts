import { type InferSchemaType, Schema, model } from "mongoose";
import preferencesSchema from "./preferences.model.js";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        birthday: {
            type: String,
            match: /^\d{4}-\d{2}-\d{2}$/,
        },
        monthlyIncome: {
            type: Number,
            min: 0,
        },
        preferences: {
            type: preferencesSchema,
            default: () => ({}),
            required: true,
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
            required: true
        },
        emailVerified: {
            type: Boolean,
            default: false,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: true,
        },
        accountStatus: {
            type: String,
            enum: ["active", "disabled"],
            default: "active",
            required: true,
        },
        emailVerificationTokenHash: {
            type: String,
            select: false,
        },
        emailVerificationExpiresAt: {
            type: Date,
            select: false,
        },
        passwordResetTokenHash: {
            type: String,
            select: false,
        },
        passwordResetExpiresAt: {
            type: Date,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);