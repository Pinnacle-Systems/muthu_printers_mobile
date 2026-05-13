import { validateBody, z } from "@repo/validation";
import { Router } from "express";
import { postEcho } from "../controllers/echo.controller.js";

export const echoRoutes = Router();

const echoBodySchema = z.object({
  message: z.string().min(1)
});

// Example endpoint showing shared request validation middleware.
echoRoutes.post("/echo", validateBody(echoBodySchema), postEcho);
