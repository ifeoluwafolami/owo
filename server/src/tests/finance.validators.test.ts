import assert from "node:assert/strict";
import test from "node:test";
import { createExpenseSchema, createSavingsGoalSchema, listQuerySchema, updateExpenseSchema } from "../validators/finance.validators.js";

test("expense input parses API dates and requires positive integer amounts", () => {
    assert.equal(createExpenseSchema.safeParse({
        categoryId: "690abc123456789012345678",
        name: "Market groceries",
        amount: 18500,
        occurredAt: "2026-10-19",
    }).success, true);
    assert.equal(createExpenseSchema.safeParse({
        categoryId: "wrong",
        name: "Market groceries",
        amount: 0,
        occurredAt: "not-a-date",
    }).success, false);
});

test("empty resource updates and inverted date ranges are rejected", () => {
    assert.equal(updateExpenseSchema.safeParse({}).success, false);
    assert.equal(listQuerySchema.safeParse({ from: "2026-11-02", to: "2026-11-01" }).success, false);
});

test("savings goals require a target and date", () => {
    assert.equal(createSavingsGoalSchema.safeParse({
        title: "Emergency fund",
        targetAmount: 500000,
        targetDate: "2027-10-19",
    }).success, true);
});
