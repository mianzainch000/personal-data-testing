const LoginAttempt = require("../models/loginAttemptSchema");

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
};

exports.checkLoginLock = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    req._clientIp = ip;

    const record = await LoginAttempt.findOne({ ip });

    if (record?.lockedUntil && record.lockedUntil > new Date()) {
      const remainingMs = record.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(429).json({
        message: `Too many failed attempts. Please try again in ${remainingMin} minute(s).`,
      });
    }

    next();
  } catch (err) {
    console.error("checkLoginLock error:", err.message);

    next();
  }
};

exports.registerFailedAttempt = async (req) => {
  try {
    const ip = req._clientIp || getClientIp(req);
    const now = new Date();

    let record = await LoginAttempt.findOne({ ip });

    if (!record) {
      record = new LoginAttempt({ ip, attempts: 1, firstAttemptAt: now });
    } else if (now.getTime() - record.firstAttemptAt.getTime() > WINDOW_MS) {
      record.attempts = 1;
      record.firstAttemptAt = now;
      record.lockedUntil = null;
    } else {
      record.attempts += 1;
      if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = new Date(now.getTime() + WINDOW_MS);
      }
    }

    record.expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    await record.save();
  } catch (err) {
    console.error("registerFailedAttempt error:", err.message);
  }
};

exports.clearFailedAttempts = async (req) => {
  try {
    const ip = req._clientIp || getClientIp(req);
    await LoginAttempt.deleteOne({ ip });
  } catch (err) {
    console.error("clearFailedAttempts error:", err.message);
  }
};
