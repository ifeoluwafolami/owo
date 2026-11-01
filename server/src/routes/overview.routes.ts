import { Router } from "express";
import { getOverview } from "../controllers/overview.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const overviewRouter = Router();
overviewRouter.get("/", authenticate, getOverview);
