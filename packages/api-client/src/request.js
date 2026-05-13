import { createErrorResponse } from "@repo/contracts";
import { ApiClientError } from "./errors.js";

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * @typedef {{
 *   baseUrl: string,
 *   fetchImpl?: typeof fetch,
 *   getToken?: () => string | Promise<string | undefined> | undefined,
 *   timeoutMs?: number
 * }} RequestConfig
 */

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

/**
 * @param {string} baseUrl
 * @param {string} path
 */
const buildUrl = (baseUrl, path) => {
  return `${trimTrailingSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * @param {Response} response
 */
const parseJsonResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ApiClientError("API returned invalid JSON", {
      cause: error,
      code: "INVALID_JSON_RESPONSE",
      statusCode: response.status
    });
  }
};

/**
 * @param {unknown} body
 */
const getErrorMessage = (body) => {
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error;

    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return "API request failed";
};

/**
 * @param {unknown} body
 */
const getErrorDetails = (body) => {
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error;

    if (error && typeof error === "object" && "details" in error) {
      return error.details;
    }
  }

  return createErrorResponse(new Error("API request failed")).error;
};

/**
 * @param {unknown} body
 */
const getErrorCode = (body) => {
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error;

    if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
      return error.code;
    }
  }

  return "API_ERROR";
};

/**
 * Performs a JSON API request with timeout, auth header, and normalized errors.
 *
 * @param {RequestConfig} config
 * @param {string} path
 * @param {{ method?: string, body?: unknown, headers?: Record<string, string> }} [options]
 * @returns {Promise<unknown>}
 */
export const requestJson = async (config, path, options = {}) => {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = config.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new ApiClientError("fetch is not available", {
      code: "FETCH_UNAVAILABLE"
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = config.getToken ? await config.getToken() : undefined;
    const headers = {
      Accept: "application/json",
      ...options.headers
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetchImpl(buildUrl(config.baseUrl, path), {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      method: options.method ?? "GET",
      signal: controller.signal
    });
    const responseBody = await parseJsonResponse(response);

    if (!response.ok) {
      throw new ApiClientError(getErrorMessage(responseBody), {
        code: getErrorCode(responseBody),
        details: getErrorDetails(responseBody),
        statusCode: response.status
      });
    }

    return responseBody;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiClientError("API request timed out", {
        cause: error,
        code: "TIMEOUT"
      });
    }

    throw new ApiClientError("Network request failed", {
      cause: error,
      code: "NETWORK_ERROR"
    });
  } finally {
    clearTimeout(timeout);
  }
};
