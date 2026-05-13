import cors from "cors";
import express from "express";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import routes from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);

  app.use(routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
