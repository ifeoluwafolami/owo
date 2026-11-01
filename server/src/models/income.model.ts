import { InferSchemaType, Schema, model } from "mongoose";

const incomeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        source: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        receivedAt: {
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

incomeSchema.index({ user: 1, receivedAt: -1 });

export type IncomeDocument = InferSchemaType<typeof incomeSchema>;
export const IncomeModel = model("Income", incomeSchema);
