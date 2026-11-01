import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDB(): Promise<void> {
    await mongoose.connect(config.mongodb.uri);

    console.log("MongoDB connected successfully.");
}