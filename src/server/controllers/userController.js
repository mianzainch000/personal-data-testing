require("dotenv").config();
const User = require("../models/userSchema");
const nodemailer = require("nodemailer");
const ForgetPasswordEmail = require("../emailTemplate");
const { check, validationResult } = require("express-validator");
const {
  registerFailedAttempt,
  clearFailedAttempts,
} = require("../middleware/loginRateLimiter");
const {
  verifyToken,
  generateToken,
  comparePassword,
  generateHashPassword,
} = require("../helper/authFunction");

exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "rowsPerPage customRowOptions",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      rowsPerPage: user.rowsPerPage || "all",
      customRowOptions: user.customRowOptions || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { rowsPerPage, customRowOptions } = req.body;

    const updateData = {};
    if (rowsPerPage !== undefined) updateData.rowsPerPage = String(rowsPerPage);
    if (customRowOptions !== undefined)
      updateData.customRowOptions = customRowOptions
        .map(Number)
        .filter((n) => n > 0);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("rowsPerPage customRowOptions");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Settings saved! ✅",
      rowsPerPage: updatedUser.rowsPerPage,
      customRowOptions: updatedUser.customRowOptions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  try {
    const { name, email, password, code } = req.body;

    let existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await generateHashPassword(password);
    const hashedCode = await generateHashPassword(code);

    let user = new User({
      name,
      email,
      password: hashedPassword,
      hashedCode: hashedCode,
    });

    let result = await user.save();
    result = result.toObject();
    delete result.password;
    delete result.hashedCode;

    res
      .status(201)
      .send({ message: "Account created successfully", user: result });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error." });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  try {
    const { email, password, specialCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      await registerFailedAttempt(req);
      return res.status(404).json({ message: "Invalid email" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await registerFailedAttempt(req);
      return res.status(401).json({ message: "Invalid password" });
    }

    await clearFailedAttempts(req);

    let hasAccess = false;
    if (user.hashedCode && specialCode) {
      hasAccess = await comparePassword(specialCode, user.hashedCode);
    } else {
      console.log(
        "Warning: User has no hashedCode in DB or specialCode missing in request",
      );
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.hashedCode;

    const token = generateToken(
      { _id: userResponse._id, hasAccess },
      process.env.SECRET_KEY,
      process.env.JWT_EXPIRATION,
    );

    return res.status(200).send({
      message: "Login successful",
      user: userResponse,
      token,
      hasAccess,
    });
  } catch (error) {
    console.error("Login Error Details:", error);
    res.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

exports.verifySpecialCode = async (req, res) => {
  try {
    const { specialCode } = req.body;
    if (!specialCode) {
      return res.status(400).json({ message: "Special code is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.hashedCode) {
      return res
        .status(400)
        .json({ message: "No special code has been set for this account" });
    }

    const isMatch = await comparePassword(specialCode, user.hashedCode);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect special code" });
    }

    const token = generateToken(
      { _id: user._id, hasAccess: true },
      process.env.SECRET_KEY,
      process.env.JWT_EXPIRATION,
    );

    res.status(200).json({ success: true, token, hasAccess: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error." });
  }
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errorMsg = errors.array()[0].msg;
    return res.status(400).json({ errors: errorMsg });
  }

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const tokenEmail = generateToken(
      { email },
      process.env.SECRET_KEY,
      process.env.JWT_EXPIRATION_EMAIL,
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.OWNER_EMAIL,
        pass: process.env.OWNER_PASS,
      },
    });

    const html = ForgetPasswordEmail.email(
      process.env.FRONTEND_URL,
      tokenEmail,
    );
    const emailOptions = {
      from: process.env.OWNER_EMAIL,
      to: email,
      subject: "Here's your password reset link!",
      text: "click on Button to Reset ",
      html: html,
    };

    await transporter.sendMail(emailOptions);

    return res
      .status(200)
      .send({ message: "Password reset email sent successfully." });
  } catch (error) {
    return res.status(500).send({ message: "Internal server error." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.tokenEmail;
    const { newPassword, newSpecialCode } = req.body;

    let decoded = verifyToken(token, process.env.SECRET_KEY);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (newPassword && newPassword.trim() !== "") {
      user.password = await generateHashPassword(newPassword);
    }

    if (newSpecialCode && newSpecialCode.trim() !== "") {
      user.hashedCode = await generateHashPassword(newSpecialCode);
    }

    if (!newPassword && !newSpecialCode) {
      return res
        .status(400)
        .json({ message: "Please provide at least one field to update" });
    }

    await user.save();

    return res.status(200).json({ message: "Update successful" });
  } catch (error) {
    return res.status(500).json({ message: "Token expired or server error" });
  }
};
exports.validate = (method) => {
  switch (method) {
    case "signup": {
      return [
        check("name")
          .notEmpty()
          .withMessage("Name is required")
          .isLength({ min: 2 })
          .withMessage("Name must be at least 2 characters")
          .custom((value) => value.trim()),
        check("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Please enter a valid email address")
          .custom((value) => value.trim()),
        check("password")
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 4 })
          .withMessage("Password must be at least 4 characters"),
      ];
    }

    case "login": {
      return [
        check("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Please enter a valid email address")
          .custom((value) => value.trim()),
        check("password").notEmpty().withMessage("Password is required"),
      ];
    }

    case "forgotPassword": {
      return [
        check("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Please enter a valid email address")
          .custom((value) => value.trim()),
      ];
    }
  }
};
