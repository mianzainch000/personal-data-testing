const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  // Which endpoint this counter is for (login, specialCode, signup,
  // forgotPassword, ...) so one IP can't get locked out of every
  // endpoint just because it failed one of them.
  scope: { type: String, required: true, default: "login" },
  attempts: { type: Number, default: 0 },
  firstAttemptAt: { type: Date, default: Date.now },
  lockedUntil: { type: Date, default: null },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000),
    index: { expires: 0 },
  },
});

loginAttemptSchema.index({ ip: 1, scope: 1 }, { unique: true });

module.exports =
  mongoose.models.LoginAttempt ||
  mongoose.model("LoginAttempt", loginAttemptSchema);
