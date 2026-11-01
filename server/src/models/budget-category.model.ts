import { InferSchemaType, Schema, model } from "mongoose";

const budgetCategorySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 80,
        },
        monthlyLimit: {
            type: Number,
            required: true,
            min: 0,
        },
        archivedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true, versionKey: false }
);

budgetCategorySchema.index({ user: 1, name: 1 }, { unique: true });

export type BudgetCategoryDocument = InferSchemaType<typeof budgetCategorySchema>;
export const BudgetCategoryModel = model("BudgetCategory", budgetCategorySchema);
