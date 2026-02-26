const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.isOperational = true;

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.statusCode = 400;
    err.status = "fail";
    err.message = `Duplicate value for field "${field}". Please choose another value.`;
  }

  if (err.name === "ValidationError") {
    err.statusCode = 400;
    err.status = "fail";
    const errors = Object.values(err.errors).map((el) => el.message);
    err.message = `Invalid input data: ${errors.join(". ")}`;
  }

  if (err.name === "CastError") {
    err.statusCode = 400;
    err.status = "fail";
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.status = "fail";
    err.message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.status = "fail";
    err.message = "Your token has expired. Please log in again.";
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, res);
  } else {
    sendErrorDev(err, res);
  }
};
