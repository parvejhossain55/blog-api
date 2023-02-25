const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Hash password using bcrypt
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Verify password using bcrypt
const verifyPassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

// Create and verify JSON Web Token
const createToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  return token;
};

const verifyToken = (token) => {
  const decodedToken = jwt.verify(token, secretKey);
  return decodedToken;
};

const comparePassword = (password, hashedPass) => {};

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
};
