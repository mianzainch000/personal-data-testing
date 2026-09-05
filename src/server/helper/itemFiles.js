// File-type field values are stored as a JSON string like
// {"id": "<UploadedFile _id>", "name": "..."}. Anywhere an item gets
// deleted (directly, or as a side effect of deleting its
// category/subcategory), the UploadedFile documents it references need
// to be cleaned up too, or they sit in the database forever holding
// real personal files.
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
        } catch {
          // not a file reference, ignore
        }
      }
    }
  }
  return ids;
};

const extractFileIdsFromMany = (items) =>
  items.flatMap((item) => extractFileIds(item));

module.exports = { extractFileIds, extractFileIdsFromMany };
