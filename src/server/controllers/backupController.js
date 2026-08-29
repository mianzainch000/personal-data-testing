const mongoose = require("mongoose");
const Category = require("../models/categorySchema");
const Subcategory = require("../models/subcategorySchema");
const Item = require("../models/itemSchema");
const { encrypt, decryptTabsValues } = require("../helper/itemCrypto");
const { isCategoryAccessible } = require("../helper/categoryAccess");

// Turns one Item document into a portable, label-keyed plain object
// (decrypting any "encrypt" fields so the backup is human-readable/portable).
const serializeItem = (item) => {
  const fields = item.fields || [];
  const decryptedTabs = decryptTabsValues(item.tabs || [], fields);

  return {
    title: item.title || "",
    subheading: item.subheading || "",
    detail: item.detail || "",
    link: item.link || "",
    config: item.config || {},
    order: item.order || 0,
    fields: fields.map((f) => ({ label: f.label, type: f.type || "text" })),
    tabs: decryptedTabs.map((t) => ({
      tabName: t.tabName || "",
      order: t.order || 0,
      rows: (t.rows || []).map((r) => ({
        order: r.order || 0,
        values: Object.fromEntries(
          fields.map((f) => [f.label, r.values?.[String(f._id)] ?? ""]),
        ),
      })),
    })),
  };
};

// Rebuilds an Item doc payload from a backup's serialized item, generating
// fresh field _ids and re-encrypting any "encrypt" fields for storage.
const buildItemFromBackup = (itemData, categoryId, subcategoryId, userId) => {
  const fieldsWithIds = (itemData.fields || []).map((f) => ({
    _id: new mongoose.Types.ObjectId(),
    label: f.label,
    type: f.type || "text",
  }));
  const labelToId = Object.fromEntries(
    fieldsWithIds.map((f) => [f.label, String(f._id)]),
  );
  const encryptIds = new Set(
    fieldsWithIds.filter((f) => f.type === "encrypt").map((f) => String(f._id)),
  );

  const tabs = (itemData.tabs || []).map((t) => ({
    tabName: t.tabName || "",
    order: t.order || 0,
    rows: (t.rows || []).map((r) => {
      const values = {};
      Object.entries(r.values || {}).forEach(([label, val]) => {
        const fid = labelToId[label];
        if (!fid) return;
        values[fid] =
          encryptIds.has(fid) && val ? encrypt(String(val)) : val;
      });
      return { order: r.order || 0, values };
    }),
  }));

  return {
    categoryId,
    subcategoryId: subcategoryId || null,
    title: itemData.title || "",
    subheading: itemData.subheading || "",
    detail: itemData.detail || "",
    link: itemData.link || "",
    config: itemData.config || {},
    fields: fieldsWithIds,
    tabs,
    order: itemData.order || 0,
    userId,
  };
};

exports.exportBackup = async (req, res) => {
  try {
    const userId = req.user._id;
    const [allCategories, subcategories, items] = await Promise.all([
      Category.find({ userId }).sort({ order: 1, createdAt: 1 }),
      Subcategory.find({ userId }).sort({ order: 1, createdAt: 1 }),
      Item.find({ userId }).sort({ order: 1, createdAt: 1 }),
    ]);

    // Never leak a currently-locked protected category into a backup file —
    // only include it if this session has actually unlocked it.
    const categories = allCategories.filter((c) =>
      isCategoryAccessible(c, req.user),
    );
    const skippedProtectedCount = allCategories.length - categories.length;

    const backup = {
      type: "personal-data-full-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: categories.map((c) => {
        const catSubs = subcategories.filter(
          (s) => String(s.categoryId) === String(c._id),
        );
        return {
          categoryName: c.categoryName,
          categoryLink: c.categoryLink || "",
          detail: c.detail || "",
          protected: !!c.protected,
          protectTimeoutMinutes: c.protectTimeoutMinutes || null,
          order: c.order || 0,
          items: items
            .filter(
              (it) =>
                String(it.categoryId) === String(c._id) && !it.subcategoryId,
            )
            .map(serializeItem),
          subcategories: catSubs.map((s) => ({
            subcategoryName: s.subcategoryName,
            subcategoryLink: s.subcategoryLink || "",
            detail: s.detail || "",
            order: s.order || 0,
            items: items
              .filter((it) => String(it.subcategoryId) === String(s._id))
              .map(serializeItem),
          })),
        };
      }),
    };

    res
      .status(200)
      .json({ success: true, data: backup, skippedProtectedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Import is additive only — it never deletes or overwrites existing data,
// it just adds the categories/subcategories/items from the file as new ones.
exports.importBackup = async (req, res) => {
  try {
    const userId = req.user._id;
    const backup = req.body?.backup;

    if (!backup || !Array.isArray(backup.categories)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid backup file" });
    }

    let categoriesCreated = 0;
    let subcategoriesCreated = 0;
    let itemsCreated = 0;

    for (const catData of backup.categories) {
      if (!catData?.categoryName) continue;

      const newCategory = await Category.create({
        categoryName: catData.categoryName,
        categoryLink: catData.categoryLink || "",
        detail: catData.detail || "",
        protected: !!catData.protected,
        protectTimeoutMinutes: catData.protectTimeoutMinutes || null,
        order: catData.order || 0,
        userId,
      });
      categoriesCreated++;

      for (const itData of catData.items || []) {
        await Item.create(
          buildItemFromBackup(itData, newCategory._id, null, userId),
        );
        itemsCreated++;
      }

      for (const subData of catData.subcategories || []) {
        if (!subData?.subcategoryName) continue;

        const newSub = await Subcategory.create({
          categoryId: newCategory._id,
          subcategoryName: subData.subcategoryName,
          subcategoryLink: subData.subcategoryLink || "",
          detail: subData.detail || "",
          order: subData.order || 0,
          userId,
        });
        subcategoriesCreated++;

        for (const itData of subData.items || []) {
          await Item.create(
            buildItemFromBackup(itData, newCategory._id, newSub._id, userId),
          );
          itemsCreated++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete: ${categoriesCreated} categories, ${subcategoriesCreated} subcategories, ${itemsCreated} detail cards added.`,
      categoriesCreated,
      subcategoriesCreated,
      itemsCreated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
