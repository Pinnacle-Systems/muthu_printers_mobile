import { createApiClient } from "@repo/api-client";
import { createLogger } from "@repo/logger";
import { env } from "../config/env.js";

const logger = createLogger({
  context: {
    service: "mobile"
  }
});

logger.debug("Creating API client", {
  baseUrl: env.API_BASE_URL
});

export const api = createApiClient({
  baseUrl: env.API_BASE_URL,
  timeoutMs: env.API_TIMEOUT_MS
});
