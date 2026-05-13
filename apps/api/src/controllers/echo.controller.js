/**
 * Example controller that echoes validated request input.
 *
 * @type {import("express").RequestHandler}
 */
export const postEcho = (request, response) => {
  response.status(200).json({
    message: request.body.message
  });
};
