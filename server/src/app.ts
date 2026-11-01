import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/config.js";

import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { budgetRouter } from "./routes/budget.routes.js";
import { expenseRouter } from "./routes/expense.routes.js";
import { incomeRouter } from "./routes/income.routes.js";
import { overviewRouter } from "./routes/overview.routes.js";
import { savingsRouter } from "./routes/savings.routes.js";
import { userRouter } from "./routes/user.routes.js";

import { apiLimiter } from "./middleware/rate-limiter.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

if (config.nodeEnv === "production") {
    app.set("trust proxy", 1);
}

const corsOptions: cors.CorsOptions = {
    origin: config.clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}

// 1. Security-related response headers.
app.use(helmet());

// 2. Cross-origin access policy.
app.use(cors(corsOptions));

// 3. Parse incoming JSON bodies.
app.use(express.json({ limit: "100kb" }));

// 4. Parse incoming cookies.
app.use(cookieParser());

// 5. Limit requests to API endpoints.
app.use("/api", apiLimiter);

// 6. Register API routes.
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/income", incomeRouter);
app.use("/api/savings", savingsRouter);
app.use("/api/overview", overviewRouter);

// 7. Handle unknown routes.
app.use(notFoundHandler);

// 8. Handle errors from middleware and routes.
app.use(errorHandler);

export default app;
