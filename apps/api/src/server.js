import { createLogger } from "@repo/logger";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const logger = createLogger({
  context: {
    service: "api"
  }
});

app.listen(env.PORT, () => {
  logger.info("API listening", {
    port: env.PORT
  });
});
