const multer = require("multer");

// not found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

//error handler
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    const fieldName = err.field || "unknown";
    return res.status(400).json({
      message: `File too large in field '${fieldName}'. Max size is 2MB.`,
    });
  }

  // other multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statuscode);
  res.json({
    status: "fail",
    message: err?.message,
    stack: err?.stack,
  });
};

module.exports = { errorHandler, notFound };
