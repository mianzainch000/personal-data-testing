const mongoose = require("mongoose");
const Category = require("../models/categorySchema");
const Subcategory = require("../models/subcategorySchema");
const Item = require("../models/itemSchema");
const UploadedFile = require("../models/uploadedFileSchema");
const { encrypt, decryptTabsValues } = require("../helper/itemCrypto");
const { isCategoryAccessible } = require("../helper/categoryAccess");
const { extractFileIdsFromMany } = require("../helper/itemFiles");

const MAX_EMBEDDED_FILE_SIZE = 3 * 1024 * 1024;

const serializeItem = async (item) => {
  const fields = item.fields || [];
  const decryptedTabs = decryptTabsValues(item.tabs || [], fields);
  const fileFieldIds = new Set(
    fields.filter((f) => f.type === "file").map((f) => String(f._id)),
  );

  const tabs = await Promise.all(
    decryptedTabs.map(async (t) => ({
      tabName: t.tabName || "",
      detail: t.detail || "",
      link: t.link || "",
      order: t.order || 0,
      cards: (t.cards || []).map((c) => ({
        title: c.title || "",
        link: c.link || "",
        order: c.order || 0,
      })),
      rows: await Promise.all(
        (t.rows || []).map(async (r) => {
          const values = {};
          for (const f of fields) {
            const fid = String(f._id);
            const raw = r.values?.[fid] ?? "";
            if (fileFieldIds.has(fid) && raw) {
              try {
                const ref = JSON.parse(raw);
                const fileDoc = await UploadedFile.findById(ref.id);
                values[f.label] = fileDoc
                  ? {
                      fileName: fileDoc.fileName,
                      mimeType: fileDoc.mimeType,
                      dataBase64: fileDoc.data.toString("base64"),
                    }
                  : "";
              } catch {
                values[f.label] = "";
              }
            } else {
              values[f.label] = raw;
            }
          }
          return { order: r.order || 0, values };
        }),
      ),
    })),
  );

  return {
    title: item.title || "",
    subheading: item.subheading || "",
    detail: item.detail || "",
    link: item.link || "",
    config: item.config || {},
    order: item.order || 0,
    fields: fields.map((f) => ({ label: f.label, type: f.type || "text" })),
    tabs,
  };
};

const buildItemFromBackup = async (
  itemData,
  categoryId,
  subcategoryId,
  userId,
) => {
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
  const fileIds = new Set(
    fieldsWithIds.filter((f) => f.type === "file").map((f) => String(f._id)),
  );

  const tabs = [];
  for (const t of itemData.tabs || []) {
    const rows = [];
    for (const r of t.rows || []) {
      const values = {};
      for (const [label, val] of Object.entries(r.values || {})) {
        const fid = labelToId[label];
        if (!fid) continue;

        if (
          fileIds.has(fid) &&
          val &&
          typeof val === "object" &&
          val.dataBase64
        ) {
          const buffer = Buffer.from(val.dataBase64, "base64");
          if (buffer.length > MAX_EMBEDDED_FILE_SIZE) {
            continue;
          }
          const newFile = await UploadedFile.create({
            fileName: val.fileName || "file",
            mimeType: val.mimeType || "application/octet-stream",
            data: buffer,
            userId,
          });
          values[fid] = JSON.stringify({
            id: newFile._id,
            name: newFile.fileName,
          });
        } else if (encryptIds.has(fid) && val) {
          values[fid] = encrypt(String(val));
        } else {
          values[fid] = val;
        }
      }
      rows.push({ order: r.order || 0, values });
    }
    tabs.push({
      tabName: t.tabName || "",
      detail: t.detail || "",
      link: t.link || "",
      order: t.order || 0,
      rows,
      cards: (t.cards || []).map((c) => ({
        title: c.title || "",
        link: c.link || "",
        order: c.order || 0,
      })),
    });
  }

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

    const categories = allCategories.filter((c) =>
      isCategoryAccessible(c, req.user),
    );
    const skippedProtectedCount = allCategories.length - categories.length;

    const backupCategories = [];
    for (const c of categories) {
      const catSubs = subcategories.filter(
        (s) => String(s.categoryId) === String(c._id),
      );

      const directItems = await Promise.all(
        items
          .filter(
            (it) =>
              String(it.categoryId) === String(c._id) && !it.subcategoryId,
          )
          .map(serializeItem),
      );

      const subcategoriesOut = [];
      for (const s of catSubs) {
        const subItems = await Promise.all(
          items
            .filter((it) => String(it.subcategoryId) === String(s._id))
            .map(serializeItem),
        );
        subcategoriesOut.push({
          subcategoryName: s.subcategoryName,
          subcategoryLink: s.subcategoryLink || "",
          detail: s.detail || "",
          order: s.order || 0,
          items: subItems,
        });
      }

      backupCategories.push({
        categoryName: c.categoryName,
        categoryLink: c.categoryLink || "",
        detail: c.detail || "",
        protected: !!c.protected,
        protectTimeoutMinutes: c.protectTimeoutMinutes || null,
        order: c.order || 0,
        items: directItems,
        subcategories: subcategoriesOut,
      });
    }

    const backup = {
      type: "personal-data-full-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: backupCategories,
    };

    res
      .status(200)
      .json({ success: true, data: backup, skippedProtectedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importBackup = async (req, res) => {
  try {
    const userId = req.user._id;
    const backup = req.body?.backup;

    if (!backup || !Array.isArray(backup.categories)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid backup file" });
    }

    const existingItems = await Item.find({ userId });
    const fileIdsToDelete = extractFileIdsFromMany(existingItems);
    if (fileIdsToDelete.length) {
      await UploadedFile.deleteMany({
        _id: { $in: fileIdsToDelete },
        userId,
      });
    }
    await Item.deleteMany({ userId });
    await Subcategory.deleteMany({ userId });
    await Category.deleteMany({ userId });

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
        const itemDoc = await buildItemFromBackup(
          itData,
          newCategory._id,
          null,
          userId,
        );
        await Item.create(itemDoc);
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
          const itemDoc = await buildItemFromBackup(
            itData,
            newCategory._id,
            newSub._id,
            userId,
          );
          await Item.create(itemDoc);
          itemsCreated++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Import complete: your existing data was replaced with ${categoriesCreated} categories, ${subcategoriesCreated} subcategories, and ${itemsCreated} detail cards from the backup.`,
      categoriesCreated,
      subcategoriesCreated,
      itemsCreated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
