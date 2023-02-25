const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// Register a new user
router.post("/register", UserController.register);

// Verify email on new User
router.get("/verify-email", UserController.verifyEmail);

// Log in an existing user
router.post("/login", UserController.login);

// Send a password reset email
router.post("/forgot-password", UserController.forgotPassword);

// Verify a password reset token
router.post("/verify-reset-token/:token", UserController.verifyResetToken);

// Change a user's password
router.post("/change-password/:token", UserController.changePassword);

module.exports = router;

