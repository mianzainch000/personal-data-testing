const { encrypt, decrypt } = require("./authFunction");

const encryptFieldIds = (fields = []) =>
  new Set(
    (fields || [])
      .filter((f) => f.type === "encrypt")
      .map((f) => String(f._id)),
  );

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
          } catch {}
        }
      });
      return { ...r, values };
    }),
  }));
};

module.exports = { encryptFieldIds, encryptTabsValues, decryptTabsValues };
