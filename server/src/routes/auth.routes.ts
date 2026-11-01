import { Router } from "express";
import { signupSchema, loginSchema, verifyEmailSchema, resendVerificationSchema } from "../validators/auth.validators.js";
import { validateBody } from "../middleware/validate.js";
import { signup, verifyEmail, resendVerificationEmail, login, getMe, refresh, logout, logoutAll } from "../controllers/auth.controller.js";
import { loginLimiter, resendVerificationLimiter, signupLimiter, verifyEmailLimiter } from "../middleware/auth-rate-limiter.js";
import { authenticate } from "../middleware/authenticate.js";

export const authRouter = Router();

authRouter.post(
    "/signup",
    signupLimiter,
    validateBody(signupSchema),
    signup
);

authRouter.post(
    "/login",
    loginLimiter,
    validateBody(loginSchema),
    login
);

authRouter.post(
    "/verify-email",
    verifyEmailLimiter,
    validateBody(verifyEmailSchema),
    verifyEmail
);

authRouter.post(
    "/resend-verification",
    resendVerificationLimiter,
    validateBody(resendVerificationSchema),
    resendVerificationEmail
);

authRouter.get("/me", authenticate, getMe);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", authenticate, logout);

authRouter.post("/logout-all", authenticate, logoutAll);

