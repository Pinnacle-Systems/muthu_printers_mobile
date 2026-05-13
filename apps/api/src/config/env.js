import "dotenv/config";

/**
 * @param {string | undefined} value
 */
const parsePort = (value) => {
  if (!value) {
    return 4000;
  }

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
};

export const env = {
  PORT: parsePort(process.env.PORT)
};
