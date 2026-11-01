import { InferSchemaType, Schema, model } from "mongoose";

const savingsContributionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        goal: {
            type: Schema.Types.ObjectId,
            ref: "SavingsGoal",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        contributedAt: {
            type: Date,
            required: true,
            index: true,
        },
        note: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: true, versionKey: false }
);

savingsContributionSchema.index({ user: 1, contributedAt: -1 });

export type SavingsContributionDocument = InferSchemaType<typeof savingsContributionSchema>;
export const SavingsContributionModel = model("SavingsContribution", savingsContributionSchema);
