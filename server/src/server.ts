import "dotenv/config";
import app from "./app.js"
import { connectDB } from "./config/database.js";
import { config } from "./config/config.js";

async function startServer(): Promise<void> {
    try {
        await connectDB();

        app.listen(config.port, () => {
            console.log(
                `Server running on port ${config.port} in ${config.nodeEnv} mode`
            );
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exitCode = 1;
    }
}

void startServer()