import "dotenv/config";
import app from "./app.js"
import { connectDB } from "./config/database.js";
import { config } from "./config/config.js";
import mongoose from "mongoose";

async function startServer(): Promise<void> {
    try {
        await connectDB();

        const server = app.listen(config.port, "0.0.0.0", () => {
            console.log(
                `Server running on port ${config.port} in ${config.nodeEnv} mode`
            );
        });

        const shutdown = () => {
            server.close(() => {
                void mongoose.disconnect().finally(() => process.exit(0));
            });
        };

        process.once("SIGTERM", shutdown);
        process.once("SIGINT", shutdown);
    } catch (error) {
        console.error("Failed to start server", error);
        process.exitCode = 1;
    }
}

void startServer()
