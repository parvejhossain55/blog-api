const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/UserModel");
const { createToken, verifyPassword } = require("../utils/utilities");

// register user
exports.register = async (req, res) => {
  try {
    const { username, email } = req.body;

    // check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    // create new user
    const user = new User(req.body);
    await user.save();

    // generate email verification token
    const token = user.generateVerificationToken();

    // send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: email,
      from: "parvejhossain4040@gmail.com", // replace with your Gmail account email
      subject: "Email Verification",
      html: `
        <p>Thank you for registering! Please verify your email by clicking the link below:</p>
        <a href="http://localhost:3000/verify-email?token=${token}">Verify Email</a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }
      console.log(`Email sent to ${email}: ${info.response}`);
      return res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account.",
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // find user by verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid token or token has expired" });
    }

    // verify email
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// user login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user with given email exists in the database
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const passwordsMatch = verifyPassword(password, user.password);

    if (!passwordsMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    // Generate a JWT and send it in the response
    const token = createToken({
      _id: user._id,
      name: user.name,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// forgot user password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user with given email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }

    // Generate a password reset token and store it in the database
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send a password reset email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.username},</p>
        <p>You have requested a password reset for your account.</p>
        <p>Please follow the link below to reset your password:</p>
        <a href="${process.env.CLIENT_URL}/verify-reset-token/${resetToken}">${process.env.CLIENT_URL}/verify-reset-token/${resetToken}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not make this request, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email has been sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// verify password reset token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Check if token exists in the database and has not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ tokenValid: true, message: "Token is valid" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// change user password
exports.changePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Check if token exists in the database and has not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update user's password and reset token fields in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    // Send a password changed email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
        <p>Hello ${user.username},</p>
        <p>Your account password has been successfully changed.</p>
        <p>If you did not make this request, please contact our support team.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password has been changed successfully changed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
