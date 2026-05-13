import { requestJson } from "./request.js";

/**
 * @typedef {{
 *   status: "ok",
 *   service: "api",
 *   timestamp: string
 * }} HealthResponse
 */

/**
 * @typedef {{
 *   baseUrl: string,
 *   fetchImpl?: typeof fetch,
 *   getToken?: () => string | Promise<string | undefined> | undefined,
 *   timeoutMs?: number
 * }} ApiClientOptions
 */

/**
 * Creates a small fetch-based client for the Express API.
 *
 * @param {ApiClientOptions} options
 */
export const createApiClient = (options) => {
  if (!options?.baseUrl) {
    throw new Error("createApiClient requires a baseUrl");
  }

  const config = {
    baseUrl: options.baseUrl,
    fetchImpl: options.fetchImpl,
    getToken: options.getToken,
    timeoutMs: options.timeoutMs
  };

  return {
    /**
     * Calls `GET /health`.
     *
     * @returns {Promise<HealthResponse>}
     */
    getHealth: async () => {
      return requestJson(config, "/health");
    },

    /**
     * Calls the example `POST /echo` endpoint.
     *
     * @param {string} message
     * @returns {Promise<{ message: string }>}
     */
    echo: async (message) => {
      return requestJson(config, "/echo", {
        body: {
          message
        },
        method: "POST"
      });
    }
  };
};
