export function mpErrorResponse(statusCode, env = null, exception = null) {
  const responsesTextArray = {
    400: "Bad Request :^O",
    401: "Unauthorized >:^(",
    403: "Forbidden >:^(",
    500: "Internal Server Error :^(",
  };
  let additionalMessage = "";
  if (env && exception && exception.message) {
    additionalMessage += `\n ${exception.message}`;
    if (exception.stack && env.DEV) {
      additionalMessage += `\n ${exception.stack}`;
    }
  }
  return new Response(responsesTextArray[statusCode] + additionalMessage, {
    status: statusCode,
  });
}
