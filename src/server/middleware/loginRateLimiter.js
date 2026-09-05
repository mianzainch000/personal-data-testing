const LoginAttempt = require("../models/loginAttemptSchema");

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// Our custom Express adapter (server/adapter.js) resolves the real client
// IP itself (from the trusted, edge-appended X-Forwarded-For value) and
// exposes it as req.__clientIp — that's the only value we ever trust for
// security decisions. req.ip is kept only as a fallback for environments
// that don't go through the adapter (e.g. a plain `node app.js` run).
const getClientIp = (req) =>
  req.__clientIp || req.ip || req.socket?.remoteAddress || "unknown";

const isLocked = (record) =>
  Boolean(record?.lockedUntil && record.lockedUntil > new Date());

const lockedResponse = (res, record, message) => {
  const remainingMin = Math.ceil(
    (record.lockedUntil.getTime() - Date.now()) / 60000,
  );
  return res.status(429).json({
    message: `${message} Please try again in ${remainingMin} minute(s).`,
  });
};

const registerAttempt = async (ip, scope) => {
  const now = new Date();
  let record = await LoginAttempt.findOne({ ip, scope });

  if (!record) {
    record = new LoginAttempt({ ip, scope, attempts: 1, firstAttemptAt: now });
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
};

const clearAttempts = async (ip, scope) => {
  await LoginAttempt.deleteOne({ ip, scope });
};

// --- Guess-a-secret endpoints (login, special code) ------------------
// Only WRONG guesses count against the limit; the controller calls
// registerFailedAttempt/registerFailedSpecialCode itself on failure and
// clearFailedAttempts/clearFailedSpecialCode on success.
const checkLock = (scope, message) => async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    req._clientIp = ip;

    const record = await LoginAttempt.findOne({ ip, scope });
    if (isLocked(record)) return lockedResponse(res, record, message);

    next();
  } catch (err) {
    console.error(`checkLock(${scope}) error:`, err.message);
    next();
  }
};

exports.checkLoginLock = checkLock("login", "Too many failed attempts.");
exports.registerFailedAttempt = async (req) => {
  try {
    await registerAttempt(req._clientIp || getClientIp(req), "login");
  } catch (err) {
    console.error("registerFailedAttempt error:", err.message);
  }
};
exports.clearFailedAttempts = async (req) => {
  try {
    await clearAttempts(req._clientIp || getClientIp(req), "login");
  } catch (err) {
    console.error("clearFailedAttempts error:", err.message);
  }
};

exports.checkSpecialCodeLock = checkLock(
  "specialCode",
  "Too many incorrect code attempts.",
);
exports.registerFailedSpecialCode = async (req) => {
  try {
    await registerAttempt(req._clientIp || getClientIp(req), "specialCode");
  } catch (err) {
    console.error("registerFailedSpecialCode error:", err.message);
  }
};
exports.clearFailedSpecialCode = async (req) => {
  try {
    await clearAttempts(req._clientIp || getClientIp(req), "specialCode");
  } catch (err) {
    console.error("clearFailedSpecialCode error:", err.message);
  }
};

// --- Flood-control endpoints (signup, forgot password) ---------------
// Every request counts, pass or fail — this is anti-abuse (spam
// accounts, inbox bombing via forgot-password emails), not a
// wrong-guess lockout, so we register on the way in rather than
// waiting for the controller to report success/failure.
const throttle = (scope, message) => async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    req._clientIp = ip;

    const record = await LoginAttempt.findOne({ ip, scope });
    if (isLocked(record)) return lockedResponse(res, record, message);

    await registerAttempt(ip, scope);
    next();
  } catch (err) {
    console.error(`throttle(${scope}) error:`, err.message);
    next();
  }
};

exports.throttleSignup = throttle("signup", "Too many signup attempts.");
exports.throttleForgotPassword = throttle(
  "forgotPassword",
  "Too many requests.",
);
