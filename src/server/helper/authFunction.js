const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const iv_length = 16;

function loadKey(envName) {
  const raw = process.env[envName];
  if (!raw) {
    throw new Error(
      `${envName} is missing in environment. Refusing to start with an insecure default key.`,
    );
  }
  const key = Buffer.from(raw, "utf8");
  if (key.length !== 32) {
    throw new Error(
      `${envName} must be exactly 32 bytes for aes-256-cbc (got ${key.length}).`,
    );
  }
  return key;
}

const key = loadKey("ENCRYPTION_KEY");

const encrypt = (text) => {
  let iv = crypto.randomBytes(iv_length);
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (text) => {
  if (!text || !text.includes(":")) return text;

  const key1 = key;
  let key2 = null;
  if (process.env.ENCRYPTION_KEY_DEFAULT) {
    key2 = Buffer.from(process.env.ENCRYPTION_KEY_DEFAULT, "utf8");
  }

  const tryDecrypt = (currentKey) => {
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(algorithm, currentKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  };

  try {
    return tryDecrypt(key1);
  } catch (e1) {
    if (key2) {
      try {
        return tryDecrypt(key2);
      } catch (e2) {
        console.error("Decrypt failed with both keys:", e2.message);
        throw new Error("Failed to decrypt value");
      }
    }
    console.error("Decrypt failed:", e1.message);
    throw new Error("Failed to decrypt value");
  }
};
const generateHashPassword = async (pass) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pass, salt);
};

const comparePassword = async (pass, hashedPassword) => {
  return await bcrypt.compare(pass, hashedPassword);
};

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error("Expired token");
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    } else {
      throw new Error("An error occurred during token verification");
    }
  }
};

module.exports = {
  encrypt,
  decrypt,
  generateHashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
