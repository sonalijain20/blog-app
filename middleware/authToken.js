"use strict";

const jwt = require("jsonwebtoken");

const decodeToken = async function (req, res) {
  const accessToken = req.headers["authorization"];
  if (!accessToken) {
    return res.status(403).json({
      statusCode: 403,
      message: "Authorization token missing",
    });
  }
  try {
    const decoded = jwt.verify(
      accessToken.replace("Bearer ", ""),
      process.env.JWT_SECRET_KEY
    );
    req.user = decoded.userInfo;
  } catch (error) {
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
}

const verifyUser = async function (req, res, next) {
  await decodeToken(req, res);
  next();
}

module.exports = { decodeToken, verifyUser }
