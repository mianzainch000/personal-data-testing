require("dotenv").config();
const User = require("../models/userSchema");
const LoginAttempt = require("../models/loginAttemptSchema");
const nodemailer = require("nodemailer");
const ForgetPasswordEmail = require("../emailTemplate");
const { check, validationResult } = require("express-validator");
const {
  registerFailedAttempt,
  clearFailedAttempts,
  registerFailedSpecialCode,
  clearFailedSpecialCode,
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
      // Guessing the special code through /login (instead of
      // /verifySpecialCode) must count against the same lockout, or an
      // attacker could brute-force it here where no counter was ever
      // being incremented.
      const specialLock = await LoginAttempt.findOne({
        ip: req._clientIp,
        scope: "specialCode",
      });
      const isSpecialLocked =
        specialLock?.lockedUntil && specialLock.lockedUntil > new Date();

      if (!isSpecialLocked) {
        hasAccess = await comparePassword(specialCode, user.hashedCode);
        if (hasAccess) {
          await clearFailedSpecialCode(req);
        } else {
          await registerFailedSpecialCode(req);
        }
      }
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
      await registerFailedSpecialCode(req);
      return res.status(401).json({ message: "Incorrect special code" });
    }

    await clearFailedSpecialCode(req);

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

    // Always respond the same way whether or not the email is
    // registered — returning a distinct "User not found" previously let
    // anyone probe this endpoint to discover which emails have accounts
    // on this app (user enumeration). Only the side effect (sending the
    // email) is conditional on the account actually existing.
    const genericResponse = {
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };

    if (!user) {
      return res.status(200).send(genericResponse);
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

    return res.status(200).send(genericResponse);
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

    if (!newPassword && !newSpecialCode) {
      return res
        .status(400)
        .json({ message: "Please provide at least one field to update" });
    }

    // resetPassword had no length check at all, so a reset could set a
    // password shorter than what signup requires — same 8-char minimum
    // enforced here for consistency.
    if (newPassword && newPassword.trim().length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (newPassword && newPassword.trim() !== "") {
      user.password = await generateHashPassword(newPassword);
    }

    if (newSpecialCode && newSpecialCode.trim() !== "") {
      user.hashedCode = await generateHashPassword(newSpecialCode);
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
          .isLength({ min: 8 })
          .withMessage("Password must be at least 8 characters"),
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
