const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const userController = require("../controllers/userController");
const {
  checkLoginLock,
  checkSpecialCodeLock,
  throttleSignup,
  throttleForgotPassword,
} = require("../middleware/loginRateLimiter");

router.get("/get-settings", authenticate, userController.getSettings);
router.post("/update-settings", authenticate, userController.updateSettings);
router.post(
  "/verifySpecialCode",
  authenticate,
  checkSpecialCodeLock,
  userController.verifySpecialCode,
);

router.post(
  "/signup",
  throttleSignup,
  userController.validate("signup"),
  userController.signup,
);

router.post(
  "/login",
  checkLoginLock,
  userController.validate("login"),
  userController.login,
);

router.post(
  "/forgotPassword",
  throttleForgotPassword,
  userController.validate("forgotPassword"),
  userController.forgotPassword,
);

router.post(
  "/resetPassword/:tokenEmail",

  userController.resetPassword,
);

module.exports = router;
