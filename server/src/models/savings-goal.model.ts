import { InferSchemaType, Schema, model } from "mongoose";

const savingsGoalSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120,
        },
        targetAmount: {
            type: Number,
            required: true,
            min: 1,
        },
        savedAmount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        targetDate: {
            type: Date,
            required: true,
        },
        archivedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true, versionKey: false }
);

savingsGoalSchema.index({ user: 1, createdAt: -1 });

export type SavingsGoalDocument = InferSchemaType<typeof savingsGoalSchema>;
export const SavingsGoalModel = model("SavingsGoal", savingsGoalSchema);
