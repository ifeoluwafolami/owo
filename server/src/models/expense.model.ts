import { InferSchemaType, Schema, model } from "mongoose";

const expenseSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "BudgetCategory",
            required: true,
        },
        name: {
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
        occurredAt: {
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

expenseSchema.index({ user: 1, occurredAt: -1 });

export type ExpenseDocument = InferSchemaType<typeof expenseSchema>;
export const ExpenseModel = model("Expense", expenseSchema);
