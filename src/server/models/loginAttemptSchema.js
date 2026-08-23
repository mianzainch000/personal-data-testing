const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  firstAttemptAt: { type: Date, default: Date.now },
  lockedUntil: { type: Date, default: null },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000),
    index: { expires: 0 },
  },
});

module.exports =
  mongoose.models.LoginAttempt ||
  mongoose.model("LoginAttempt", loginAttemptSchema);
