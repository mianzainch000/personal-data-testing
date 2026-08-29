const { encrypt, decrypt } = require("./authFunction");

// _id strings (as strings) of fields whose type is "encrypt".
const encryptFieldIds = (fields = []) =>
  new Set(
    (fields || [])
      .filter((f) => f.type === "encrypt")
      .map((f) => String(f._id)),
  );

// Encrypts values for encrypt-type fields across all tabs/rows before saving.
const encryptTabsValues = (tabs = [], fields = []) => {
  const ids = encryptFieldIds(fields);
  if (!ids.size) return tabs;
  return (tabs || []).map((t) => ({
    ...t,
    rows: (t.rows || []).map((r) => {
      const values = { ...(r.values || {}) };
      ids.forEach((fid) => {
        const v = values[fid];
        if (v !== undefined && v !== null && v !== "") {
          values[fid] = encrypt(String(v));
        }
      });
      return { ...r, values };
    }),
  }));
};

// Decrypts values for encrypt-type fields — only ever used to build API
// responses, never written back to the database.
const decryptTabsValues = (tabs = [], fields = []) => {
  const ids = encryptFieldIds(fields);
  if (!ids.size) return tabs;
  return (tabs || []).map((t) => ({
    ...t,
    rows: (t.rows || []).map((r) => {
      const values = { ...(r.values || {}) };
      ids.forEach((fid) => {
        const v = values[fid];
        if (v) {
          try {
            values[fid] = decrypt(v);
          } catch {
            // Leave as-is (e.g. legacy plaintext saved before this field existed).
          }
        }
      });
      return { ...r, values };
    }),
  }));
};

module.exports = { encryptFieldIds, encryptTabsValues, decryptTabsValues };
