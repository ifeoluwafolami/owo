import { Schema } from "mongoose";

const preferencesSchema = new Schema(
    {
        currency: {
            type: String,
            enum: ["NGN", "USD", "GBP", "EUR", "GHS"],
            default: "NGN",
            required: true,
        },
        
        overspendingThreshold: {
            type: Number,
            min: 0,
            max: 100,
            default: 80,
            required: true,
        },

        emailNotifications: {
            type: Boolean,
            default: true,
            required: true,
        },

        inAppNotifications: {
            type: Boolean,
            default: true,
            required: true,
        },

        theme: {
            type: String,
            enum: ["ocean", "monochroma", "rose", "amethyst"],
            default: "ocean",
            required: true
        },
    },
    {
        _id: false
    }
);

export default preferencesSchema;