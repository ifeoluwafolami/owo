import { Router } from "express";
import { completeOnboarding, updateMe } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate.js";
import { updateProfileSchema } from "../validators/users.validators.js";

export const userRouter = Router();
userRouter.use(authenticate);
userRouter.patch("/me", validateBody(updateProfileSchema), updateMe);
userRouter.post("/me/onboarding", validateBody(updateProfileSchema), completeOnboarding);
