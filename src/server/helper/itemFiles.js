const extractFileIds = (item) => {
  const fileFieldIds = new Set(
    (item.fields || [])
      .filter((f) => f.type === "file")
      .map((f) => String(f._id)),
  );
  const ids = [];
  for (const tab of item.tabs || []) {
    for (const row of tab.rows || []) {
      for (const [fid, raw] of Object.entries(row.values || {})) {
        if (!fileFieldIds.has(fid) || !raw) continue;
        try {
          const ref = JSON.parse(raw);
          if (ref?.id) ids.push(ref.id);
        } catch {}
      }
    }
  }
  return ids;
};

const extractFileIdsFromMany = (items) =>
  items.flatMap((item) => extractFileIds(item));

module.exports = { extractFileIds, extractFileIdsFromMany };
