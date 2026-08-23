const Item = require("../models/itemSchema");

exports.getItems = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.query;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }

    const filter = { userId: req.user._id, categoryId };
    filter.subcategoryId = subcategoryId ? subcategoryId : null;

    const items = await Item.find(filter).sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { categoryId, subcategoryId, title, subheading, detail, link, position } =
      req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }

    if (!title?.trim() && !subheading?.trim() && !detail?.trim() && !link?.trim()) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    const filter = {
      userId: req.user._id,
      categoryId,
      subcategoryId: subcategoryId ? subcategoryId : null,
    };

    const count = await Item.countDocuments(filter);
    let insertOrder = count;

    if (position !== undefined && position !== null && position !== "") {
      const pos = Math.max(1, Math.min(Number(position), count + 1));
      insertOrder = pos - 1;

      await Item.updateMany(
        { ...filter, order: { $gte: insertOrder } },
        { $inc: { order: 1 } },
      );
    }

    const newItem = await Item.create({
      categoryId,
      subcategoryId: subcategoryId ? subcategoryId : null,
      title,
      subheading: subheading || "",
      detail: detail || "",
      link: link || "",
      userId: req.user._id,
      order: insertOrder,
    });

    res.status(201).json({
      success: true,
      data: newItem,
      message: "Card added successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { title, subheading, detail, link, position } = req.body;

    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!item)
      return res.status(404).json({ success: false, message: "Not found" });

    if (position !== undefined && position !== null && position !== "") {
      const filter = {
        userId: req.user._id,
        categoryId: item.categoryId,
        subcategoryId: item.subcategoryId,
        _id: { $ne: item._id },
      };
      const siblings = await Item.find(filter).sort({ order: 1 });

      const pos = Math.max(1, Math.min(Number(position), siblings.length + 1));
      siblings.splice(pos - 1, 0, item);

      await Promise.all(
        siblings.map((doc, index) => {
          if (String(doc._id) === String(item._id)) {
            item.order = index;
            return null;
          }
          return Item.updateOne({ _id: doc._id }, { order: index });
        }),
      );
    }

    if (title !== undefined) item.title = title;
    if (subheading !== undefined) item.subheading = subheading;
    if (detail !== undefined) item.detail = detail;
    if (link !== undefined) item.link = link;

    if (
      !item.title?.trim() &&
      !item.subheading?.trim() &&
      !item.detail?.trim() &&
      !item.link?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    await item.save();

    res.status(200).json({
      success: true,
      data: item,
      message: "Card updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const deleted = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    await Item.updateMany(
      {
        userId: req.user._id,
        categoryId: deleted.categoryId,
        subcategoryId: deleted.subcategoryId,
        order: { $gt: deleted.order },
      },
      { $inc: { order: -1 } },
    );

    res
      .status(200)
      .json({ success: true, message: "Card deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reorderItems = async (req, res) => {
  try {
    const { newOrderIds } = req.body;

    const bulkOps = (newOrderIds || []).map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user._id },
        update: { order: index },
      },
    }));

    if (bulkOps.length) {
      await Item.bulkWrite(bulkOps);
    }

    res
      .status(200)
      .json({ success: true, message: "New order saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reorder" });
  }
};
