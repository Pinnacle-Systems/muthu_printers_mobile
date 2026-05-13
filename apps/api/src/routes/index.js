import { Router } from "express";
import { echoRoutes } from "./echo.routes.js";
import { healthRoutes } from "./health.routes.js";

const routes = Router();

routes.use(healthRoutes);
routes.use(echoRoutes);

export default routes;
