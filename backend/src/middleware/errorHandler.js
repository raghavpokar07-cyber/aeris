module.exports = (error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.name === "ZodError"
    ? "Please check the request fields and try again."
    : status === 500
      ? "Internal server error"
      : error.message;
  const response = { error: message };
  if (error.dailyLimit === true) response.dailyLimit = true;
  res.status(status).json(response);
};
