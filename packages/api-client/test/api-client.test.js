import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApiClientError, createApiClient } from "../src/index.js";

const createJsonResponse = (body, options = {}) => {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json"
    },
    status: options.status ?? 200
  });
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("createApiClient", () => {
  test("performs a successful health call", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse({
        status: "ok",
        service: "api",
        timestamp: "2026-05-13T00:00:00.000Z"
      })
    );
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    await expect(client.getHealth()).resolves.toEqual({
      status: "ok",
      service: "api",
      timestamp: "2026-05-13T00:00:00.000Z"
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/health",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json"
        }),
        method: "GET"
      })
    );
  });

  test("performs an echo call with JSON body and authorization", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse({
        message: "hello"
      })
    );
    const client = createApiClient({
      baseUrl: "https://api.example.test/",
      fetchImpl,
      getToken: () => "token_123"
    });

    await expect(client.echo("hello")).resolves.toEqual({
      message: "hello"
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.test/echo",
      expect.objectContaining({
        body: JSON.stringify({
          message: "hello"
        }),
        headers: expect.objectContaining({
          Authorization: "Bearer token_123",
          "Content-Type": "application/json"
        }),
        method: "POST"
      })
    );
  });

  test("throws a timeout error", async () => {
    vi.useFakeTimers();

    const fetchImpl = vi.fn((_url, options) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetchImpl,
      timeoutMs: 5
    });
    const request = client.getHealth();
    const expectation = expect(request).rejects.toMatchObject({
      code: "TIMEOUT"
    });

    await vi.advanceTimersByTimeAsync(5);
    await expectation;

    vi.useRealTimers();
  });

  test("throws a network error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("socket closed"));
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    await expect(client.getHealth()).rejects.toMatchObject({
      code: "NETWORK_ERROR"
    });
  });

  test("throws an API error response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            details: [
              {
                path: "message"
              }
            ],
            message: "Validation failed"
          }
        },
        {
          status: 400
        }
      )
    );
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    await expect(client.echo("")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: [
        {
          path: "message"
        }
      ],
      message: "Validation failed",
      statusCode: 400
    });
  });

  test("throws an invalid JSON response error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("not json", {
        status: 200
      })
    );
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetchImpl
    });

    const request = client.getHealth();

    await expect(request).rejects.toBeInstanceOf(ApiClientError);
    await expect(request).rejects.toMatchObject({
      code: "INVALID_JSON_RESPONSE"
    });
  });
});
