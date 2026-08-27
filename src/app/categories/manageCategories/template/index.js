"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";
import UnlockProtected from "@/components/UnlockProtected";
import handleAxiosError from "@/components/HandleAxiosError";
import styles from "@/css/ManageCategories.module.css";

const emptyCategoryForm = {
  categoryName: "",
  categoryLink: "",
  detail: "",
  position: "",
  protected: false,
  protectTimeoutMinutes: "",
};
const emptySubForm = {
  subcategoryName: "",
  subcategoryLink: "",
  detail: "",
  position: "",
};
const emptyItemConfig = {
  table: false,
  tabs: false,
  dragDrop: false,
  pagination: false,
  search: false,
  filter: false,
  pdf: false,
  json: false,
  exportJson: false,
};
const emptyItemForm = {
  title: "",
  subheading: "",
  detail: "",
  link: "",
  position: "",
  config: emptyItemConfig,
  fields: [],
};

// Extra widgets, only shown once "Table" is checked.
const WIDGET_OPTIONS = [
  { key: "tabs", icon: "📁", label: "Tabs (Meter 1 / Meter 2 jaisi groups)" },
  { key: "dragDrop", icon: "🔀", label: "Drag & Drop Reorder" },
  { key: "pagination", icon: "🔢", label: "Pagination" },
  { key: "pdf", icon: "📄", label: "PDF Download" },
  { key: "json", icon: "📃", label: "JSON Download" },
  { key: "exportJson", icon: "🧳", label: "Export / Import (JSON backup)" },
  { key: "search", icon: "🔍", label: "Search" },
  { key: "filter", icon: "🎛️", label: "Filter" },
];

const CategoryClientWrapper = () => {
  const showAlertMessage = useSnackbar();

  const [loading, setLoading] = useState(false);

  // Step 1 - Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = useState(false);

  // Step 2 - Subcategories
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState(emptySubForm);
  const [editingSubcategory, setEditingSubcategory] = useState(false);

  // Step 3/4 - Detail cards (Items)
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, message }
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const selectedSubcategory = subcategories.find(
    (s) => s._id === selectedSubcategoryId,
  );

  // ---------- Fetchers ----------
  const fetchCategories = async (keepSelection = true) => {
    try {
      const res = await axios.get("manageCategories/api");
      const list = res?.data?.data || [];
      setCategories(list);
      if (!keepSelection || !list.some((c) => c._id === selectedCategoryId)) {
        setSelectedCategoryId(list[0]?._id || "");
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  const fetchSubcategories = async (categoryId, keepSelection = true) => {
    if (!categoryId) {
      setSubcategories([]);
      setSelectedSubcategoryId("");
      return;
    }
    try {
      const res = await axios.get(
        `manageCategories/subcategories/api?categoryId=${categoryId}`,
      );
      const list = res?.data?.data || [];
      setSubcategories(list);
      if (
        !keepSelection ||
        !list.some((s) => s._id === selectedSubcategoryId)
      ) {
        setSelectedSubcategoryId("");
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  const fetchItems = async (categoryId, subcategoryId) => {
    if (!categoryId) {
      setItems([]);
      return;
    }
    try {
      const qs = subcategoryId ? `&subcategoryId=${subcategoryId}` : "";
      const res = await axios.get(
        `items/api?categoryId=${categoryId}${qs}`,
      );
      setItems(res?.data?.data || []);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSubcategories(selectedCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchItems(selectedCategoryId, selectedSubcategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedSubcategoryId]);

  // ---------- Step 1: Category actions ----------
  const openEditCategory = () => {
    if (!selectedCategory) return;
    setCategoryForm({
      categoryName: selectedCategory.categoryName || "",
      categoryLink: selectedCategory.categoryLink || "",
      detail: selectedCategory.detail || "",
      position:
        selectedCategory.order !== undefined && selectedCategory.order !== null
          ? String(selectedCategory.order + 1)
          : "",
      protected: Boolean(selectedCategory.protected),
      protectTimeoutMinutes: selectedCategory.protectTimeoutMinutes
        ? String(selectedCategory.protectTimeoutMinutes)
        : "",
    });
    setEditingCategory(true);
    setShowCategoryForm(true);
  };

  const openCreateCategory = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategory(false);
    setShowCategoryForm(true);
  };

  const submitCategoryForm = async (e) => {
    e.preventDefault();
    if (!categoryForm.categoryName.trim()) return;
    setLoading(true);
    try {
      const payload = {
        ...categoryForm,
        position:
          categoryForm.position !== "" ? Number(categoryForm.position) : undefined,
      };
      const res =
        editingCategory && selectedCategoryId
          ? await axios.put(
              `manageCategories/api/${selectedCategoryId}`,
              payload,
            )
          : await axios.post("manageCategories/api", payload);

      showAlertMessage({
        message:
          res?.data?.message ||
          (editingCategory ? "Category Updated" : "Category Added"),
        type: "success",
      });

      const newId = res?.data?.data?._id;
      setShowCategoryForm(false);
      setCategoryForm(emptyCategoryForm);
      setEditingCategory(false);
      await fetchCategories(false);
      if (!editingCategory && newId) setSelectedCategoryId(newId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    try {
      const res = await axios.delete(
        `manageCategories/api/${deleteTarget.id}`,
      );
      showAlertMessage({
        message: res?.data?.message || "Deleted successfully",
        type: "success",
      });
      setSelectedCategoryId("");
      await fetchCategories(false);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ---------- Step 2: Subcategory actions ----------
  const openEditSubcategory = () => {
    if (!selectedSubcategory) return;
    setSubForm({
      subcategoryName: selectedSubcategory.subcategoryName || "",
      subcategoryLink: selectedSubcategory.subcategoryLink || "",
      detail: selectedSubcategory.detail || "",
      position:
        selectedSubcategory.order !== undefined &&
        selectedSubcategory.order !== null
          ? String(selectedSubcategory.order + 1)
          : "",
    });
    setEditingSubcategory(true);
    setShowSubForm(true);
  };

  const openCreateSubcategory = () => {
    setSubForm(emptySubForm);
    setEditingSubcategory(false);
    setShowSubForm(true);
  };

  const submitSubForm = async (e) => {
    e.preventDefault();
    if (!subForm.subcategoryName.trim() || !selectedCategoryId) return;
    setLoading(true);
    try {
      const payload = {
        ...subForm,
        categoryId: selectedCategoryId,
        position: subForm.position !== "" ? Number(subForm.position) : undefined,
      };
      const res =
        editingSubcategory && selectedSubcategoryId
          ? await axios.put(
              `manageCategories/subcategories/api/${selectedSubcategoryId}`,
              payload,
            )
          : await axios.post("manageCategories/subcategories/api", payload);

      showAlertMessage({
        message:
          res?.data?.message ||
          (editingSubcategory ? "Subcategory Updated" : "Subcategory Added"),
        type: "success",
      });

      const newId = res?.data?.data?._id;
      setShowSubForm(false);
      setSubForm(emptySubForm);
      setEditingSubcategory(false);
      await fetchSubcategories(selectedCategoryId, false);
      if (!editingSubcategory && newId) setSelectedSubcategoryId(newId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async () => {
    try {
      const res = await axios.delete(
        `manageCategories/subcategories/api/${deleteTarget.id}`,
      );
      showAlertMessage({
        message: res?.data?.message || "Deleted successfully",
        type: "success",
      });
      setSelectedSubcategoryId("");
      await fetchSubcategories(selectedCategoryId, false);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ---------- Step 3/4: Detail card (Item) actions ----------
  const openCreateItem = () => {
    setItemForm(emptyItemForm);
    setEditingItemId(null);
    setNewFieldLabel("");
    setNewFieldType("text");
    setEditingFieldIndex(null);
    setShowItemForm(true);
  };

  const openEditItem = (item) => {
    setItemForm({
      title: item.title || "",
      subheading: item.subheading || "",
      detail: item.detail || "",
      link: item.link || "",
      position:
        item.order !== undefined && item.order !== null
          ? String(item.order + 1)
          : "",
      config: { ...emptyItemConfig, ...(item.config || {}) },
      fields: (item.fields || []).map((f) => ({
        _id: f._id,
        label: f.label,
        type: f.type || "text",
      })),
    });
    setEditingItemId(item._id);
    setNewFieldLabel("");
    setNewFieldType("text");
    setEditingFieldIndex(null);
    setShowItemForm(true);
  };

  const submitItemForm = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) return;

    const hasAnyValue =
      itemForm.title.trim() ||
      itemForm.subheading.trim() ||
      itemForm.detail.trim() ||
      itemForm.link.trim() ||
      itemForm.fields.length > 0;

    if (!hasAnyValue) {
      showAlertMessage({
        message: "At least one field is required",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...itemForm,
        categoryId: selectedCategoryId,
        subcategoryId: selectedSubcategoryId || null,
        position:
          itemForm.position !== "" ? Number(itemForm.position) : undefined,
      };
      const res = editingItemId
        ? await axios.put(`items/api/${editingItemId}`, payload)
        : await axios.post("items/api", payload);

      showAlertMessage({
        message:
          res?.data?.message ||
          (editingItemId ? "Card Updated" : "Card Added"),
        type: "success",
      });

      setShowItemForm(false);
      setItemForm(emptyItemForm);
      setEditingItemId(null);
      fetchItems(selectedCategoryId, selectedSubcategoryId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    try {
      const res = await axios.delete(`items/api/${deleteTarget.id}`);
      showAlertMessage({
        message: res?.data?.message || "Deleted successfully",
        type: "success",
      });
      fetchItems(selectedCategoryId, selectedSubcategoryId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") return deleteCategory();
    if (deleteTarget.type === "subcategory") return deleteSubcategory();
    return deleteItem();
  };

  return (
    <div className={styles.pageWrap}>
      {loading && <Loader />}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        confirmText="Yes, Delete"
        message={deleteTarget?.message || "Are you sure you want to delete this?"}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
      />

      {/* Step 1: Category */}
      <div className={styles.stepCard}>
        <p className={styles.stepTitle}>
          <span className={styles.stepBadge}>1</span>
          Select a Category (Heading) <UnlockProtected />
        </p>

        <select
          className={styles.select}
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">— Select —</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.protected ? "🔒 " : ""}
              {c.categoryName}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <div className={styles.groupButtons}>
            <button className={styles.editBtn} onClick={openEditCategory}>
              ✏️ Edit this category
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => {
                setDeleteTarget({
                  type: "category",
                  id: selectedCategoryId,
                  message:
                    "Are you sure you want to delete this category? Its subcategories and cards will be deleted too.",
                });
                setShowDeleteModal(true);
              }}
            >
              🗑️ Delete this category
            </button>
          </div>
        )}

        <button
          type="button"
          className={styles.toggleCreate}
          onClick={() =>
            showCategoryForm ? setShowCategoryForm(false) : openCreateCategory()
          }
        >
          {showCategoryForm ? "▾" : "▸"} + Create a new category
        </button>

        {showCategoryForm && (
          <form className={styles.createPanel} onSubmit={submitCategoryForm}>
            <input
              type="text"
              placeholder="Category Name (e.g. Recipes, Books)"
              value={categoryForm.categoryName}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  categoryName: e.target.value,
                })
              }
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Index (optional, e.g. 2)"
              value={categoryForm.position}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  position: e.target.value,
                })
              }
            />
            <label className={styles.widgetSectionLabel}>
              <input
                type="checkbox"
                checked={categoryForm.protected}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    protected: e.target.checked,
                  })
                }
              />
              🔒 Protect (login par special code na dalein to ye category
              dropdown/main page mein na dikhe)
            </label>

            {categoryForm.protected && (
              <div className={styles.inlineRow} style={{ marginTop: "0.5rem" }}>
                <input
                  type="number"
                  min="1"
                  placeholder="Auto-lock after kitne minute? (khali chhoro to poori session tak dikhegi)"
                  value={categoryForm.protectTimeoutMinutes}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      protectTimeoutMinutes: e.target.value,
                    })
                  }
                />
              </div>
            )}
            <div className={styles.createActions}>
              <button type="submit" className={styles.editBtn}>
                {editingCategory ? "Update" : "Create"}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setShowCategoryForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Step 2: Subcategory */}
      {selectedCategoryId && (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>
            <span className={styles.stepBadge}>2</span>
            &quot;{selectedCategory?.categoryName}&quot; ke andar Sub Heading
            select karo
          </p>

          <select
            className={styles.select}
            value={selectedSubcategoryId}
            onChange={(e) => setSelectedSubcategoryId(e.target.value)}
          >
            <option value="">— Select — (Direct cards, no sub heading)</option>
            {subcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subcategoryName}
              </option>
            ))}
          </select>

          {selectedSubcategory && (
            <div className={styles.groupButtons}>
              <button className={styles.editBtn} onClick={openEditSubcategory}>
                ✏️ Edit this sub heading
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  setDeleteTarget({
                    type: "subcategory",
                    id: selectedSubcategoryId,
                    message:
                      "Are you sure you want to delete this sub heading? Its cards will be deleted too.",
                  });
                  setShowDeleteModal(true);
                }}
              >
                🗑️ Delete this sub heading
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.toggleCreate}
            onClick={() =>
              showSubForm ? setShowSubForm(false) : openCreateSubcategory()
            }
          >
            {showSubForm ? "▾" : "▸"} + &quot;{selectedCategory?.categoryName}
            &quot; ke andar nai sub heading banao
          </button>

          {showSubForm && (
            <form className={styles.createPanel} onSubmit={submitSubForm}>
              <input
                type="text"
                placeholder="Sub Heading Name (e.g. Namaz, Wudu)"
                value={subForm.subcategoryName}
                onChange={(e) =>
                  setSubForm({ ...subForm, subcategoryName: e.target.value })
                }
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Index (optional, e.g. 2)"
                value={subForm.position}
                onChange={(e) =>
                  setSubForm({ ...subForm, position: e.target.value })
                }
              />
              <div className={styles.createActions}>
                <button type="submit" className={styles.editBtn}>
                  {editingSubcategory ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setShowSubForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 3: Add detail card */}
      {selectedCategoryId && (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>
            <span className={styles.stepBadge}>3</span>
            &quot;
            {selectedSubcategory?.subcategoryName ||
              selectedCategory?.categoryName}
            &quot; mein naya detail card add karo
          </p>

          <button
            type="button"
            className={styles.toggleCreate}
            onClick={() =>
              showItemForm ? setShowItemForm(false) : openCreateItem()
            }
          >
            {showItemForm ? "▾" : "▸"} + Add Detail Card
          </button>

          {showItemForm && (
            <form className={styles.createPanel} onSubmit={submitItemForm}>
              <textarea
                placeholder="Detail (optional)"
                value={itemForm.detail}
                onChange={(e) =>
                  setItemForm({ ...itemForm, detail: e.target.value })
                }
              />

              <div className={styles.widgetSection}>
                <label className={styles.widgetSectionLabel}>
                  <input
                    type="checkbox"
                    checked={itemForm.config.table}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        config: {
                          ...itemForm.config,
                          table: e.target.checked,
                        },
                      })
                    }
                  />
                  📊 Table (is card mein dynamic responsive table dikhao)
                </label>

                {itemForm.config.table && (
                  <>
                    <p className={styles.widgetGridCaption}>
                      Advanced Detail Card (optional) — Table, Tabs, PDF/JSON,
                      Pagination, Search, Filter
                    </p>
                    <div className={styles.checkboxGrid}>
                      {WIDGET_OPTIONS.map((opt) => (
                        <label key={opt.key} className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            checked={itemForm.config[opt.key]}
                            onChange={(e) =>
                              setItemForm({
                                ...itemForm,
                                config: {
                                  ...itemForm.config,
                                  [opt.key]: e.target.checked,
                                },
                              })
                            }
                          />
                          <span className={styles.checkboxIcon}>{opt.icon}</span>
                          {opt.label}
                        </label>
                      ))}
                    </div>

                    <div className={styles.fieldsBuilder}>
                      <p className={styles.fieldsBuilderLabel}>
                        Table ke columns / fields (jo marzi naam rakho):
                      </p>

                      {itemForm.fields.length > 0 && (
                        <div className={styles.fieldChips}>
                          {itemForm.fields.map((f, idx) => (
                            <span
                              key={f._id || `new-${idx}`}
                              className={`${styles.fieldChip} ${
                                editingFieldIndex === idx
                                  ? styles.fieldChipEditing
                                  : ""
                              }`}
                            >
                              {f.type === "encrypt" && "🔒 "}
                              {f.label} <em>({f.type})</em>
                              <button
                                type="button"
                                title="Edit"
                                onClick={() => {
                                  setEditingFieldIndex(idx);
                                  setNewFieldLabel(f.label);
                                  setNewFieldType(f.type || "text");
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                title="Delete"
                                onClick={() => {
                                  setItemForm({
                                    ...itemForm,
                                    fields: itemForm.fields.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  });
                                  if (editingFieldIndex === idx) {
                                    setEditingFieldIndex(null);
                                    setNewFieldLabel("");
                                    setNewFieldType("text");
                                  }
                                }}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.inlineRow}>
                        <input
                          type="text"
                          placeholder="Field name (e.g. Month, Reading, Amount)"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                        />
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="email">Email</option>
                          <option value="encrypt">
                            🔒 Encrypt (DB mein encrypted, UI mein plain)
                          </option>
                        </select>
                        <button
                          type="button"
                          className={styles.ghostBtn}
                          onClick={() => {
                            if (!newFieldLabel.trim()) return;
                            if (editingFieldIndex !== null) {
                              setItemForm({
                                ...itemForm,
                                fields: itemForm.fields.map((f, i) =>
                                  i === editingFieldIndex
                                    ? {
                                        ...f,
                                        label: newFieldLabel.trim(),
                                        type: newFieldType,
                                      }
                                    : f,
                                ),
                              });
                              setEditingFieldIndex(null);
                            } else {
                              setItemForm({
                                ...itemForm,
                                fields: [
                                  ...itemForm.fields,
                                  { label: newFieldLabel.trim(), type: newFieldType },
                                ],
                              });
                            }
                            setNewFieldLabel("");
                            setNewFieldType("text");
                          }}
                        >
                          {editingFieldIndex !== null ? "Update Field" : "+ Add Field"}
                        </button>
                        {editingFieldIndex !== null && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => {
                              setEditingFieldIndex(null);
                              setNewFieldLabel("");
                              setNewFieldType("text");
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <input
                type="text"
                placeholder="Link (optional)"
                value={itemForm.link}
                onChange={(e) =>
                  setItemForm({ ...itemForm, link: e.target.value })
                }
              />
              <input
                type="number"
                min="1"
                placeholder="Index (optional, e.g. 2)"
                value={itemForm.position}
                onChange={(e) =>
                  setItemForm({ ...itemForm, position: e.target.value })
                }
              />
              <div className={styles.createActions}>
                <button type="submit" className={styles.editBtn}>
                  {editingItemId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => {
                    setShowItemForm(false);
                    setEditingItemId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 4: List of detail cards */}
      {selectedCategoryId && (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>
            <span className={styles.stepBadge}>4</span>
            &quot;
            {selectedSubcategory?.subcategoryName ||
              selectedCategory?.categoryName}
            &quot; ke detail cards ({items.length})
          </p>

          {items.length === 0 && (
            <p className={styles.disabledHint}>Koi card nahi bana abhi.</p>
          )}

          <div className={styles.detailList}>
            {items.map((item, index) => (
              <div key={item._id} className={styles.detailRow}>
                <span className={styles.detailNumber}>{index + 1}</span>
                <div className={styles.detailBody}>
                  {item.title && (
                    <p className={styles.detailTitle}>{item.title}</p>
                  )}
                  {item.subheading && (
                    <p className={styles.detailSubheading}>
                      {item.subheading}
                    </p>
                  )}
                  {item.detail && (
                    <p className={styles.detailText}>{item.detail}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardLink}
                    >
                      {item.link}
                    </a>
                  )}
                </div>
                <div className={styles.detailActions}>
                  <span onClick={() => openEditItem(item)} title="Edit">
                    ✏️
                  </span>
                  <span
                    onClick={() => {
                      setDeleteTarget({
                        type: "item",
                        id: item._id,
                        message: "Are you sure you want to delete this card?",
                      });
                      setShowDeleteModal(true);
                    }}
                    title="Delete"
                  >
                    🗑️
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryClientWrapper;
