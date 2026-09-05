"use client";
import axios from "axios";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";
import InlineSpinner from "@/components/InlineSpinner";
import styles from "@/css/ManageCategories.module.css";
import UnlockProtected from "@/components/UnlockProtected";
import handleAxiosError from "@/components/HandleAxiosError";

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
  newRowPosition: "top",
  addTabButtonLabel: "",
  messages: { rowAdded: "", rowUpdated: "", rowDeleted: "" },
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

const WIDGET_OPTIONS = [
  { key: "table", icon: "📊", label: "Table" },
  { key: "tabs", icon: "📁", label: "Tabs" },
  { key: "dragDrop", icon: "🔀", label: "Drag & Drop Reorder" },
  { key: "pagination", icon: "🔢", label: "Pagination" },
  { key: "pdf", icon: "📄", label: "PDF Download" },
  { key: "exportJson", icon: "🧳", label: "Export / Import (JSON backup)" },
  { key: "search", icon: "🔍", label: "Search" },
  { key: "filter", icon: "🎛️", label: "Filter" },
];

const CategoryClientWrapper = () => {
  const showAlertMessage = useSnackbar();

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [adminTab, setAdminTab] = useState("content");
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupResultMsg, setBackupResultMsg] = useState("");
  const [pendingImportBackup, setPendingImportBackup] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = useState(false);

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState(emptySubForm);
  const [editingSubcategory, setEditingSubcategory] = useState(false);

  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const selectedSubcategory = subcategories.find(
    (s) => s._id === selectedSubcategoryId,
  );

  const fetchCategories = async (keepSelection = true) => {
    setCategoriesLoading(true);
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
    } finally {
      setCategoriesLoading(false);
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
      const res = await axios.get(`items/api?categoryId=${categoryId}${qs}`);
      setItems(res?.data?.data || []);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubcategories(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchItems(selectedCategoryId, selectedSubcategoryId);
  }, [selectedCategoryId, selectedSubcategoryId]);

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
          categoryForm.position !== ""
            ? Number(categoryForm.position)
            : undefined,
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
      const res = await axios.delete(`manageCategories/api/${deleteTarget.id}`);
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
        position:
          subForm.position !== "" ? Number(subForm.position) : undefined,
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

  const openCreateItem = () => {
    setItemForm(emptyItemForm);
    setEditingItemId(null);
    setNewFieldLabel("");
    setNewFieldType("text");
    setEditingFieldIndex(null);
    setShowAdvancedFeatures(false);
    setShowItemForm(true);
  };

  const openEditItem = (item) => {
    const mergedConfig = { ...emptyItemConfig, ...(item.config || {}) };
    setItemForm({
      title: item.title || "",
      subheading: item.subheading || "",
      detail: item.detail || "",
      link: item.link || "",
      position:
        item.order !== undefined && item.order !== null
          ? String(item.order + 1)
          : "",
      config: mergedConfig,
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
    // Auto-expand the advanced features panel if any were already picked
    setShowAdvancedFeatures(
      WIDGET_OPTIONS.some((opt) => mergedConfig[opt.key]),
    );
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
          res?.data?.message || (editingItemId ? "Card Updated" : "Card Added"),
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

  const downloadFullBackup = async () => {
    setBackupLoading(true);
    setBackupResultMsg("");
    try {
      const res = await axios.get("manageCategories/backup/api");
      const backup = res?.data?.data;
      const skipped = res?.data?.skippedProtectedCount || 0;
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `personal-data-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (skipped > 0) {
        setBackupResultMsg(
          `Backup downloaded, but ${skipped} protected categor${skipped === 1 ? "y was" : "ies were"
          } NOT included (session not unlocked). Use 🔓 to enter the code and download again if you need them too.`,
        );
        showAlertMessage({
          message: `Backup downloaded (${skipped} protected categor${skipped === 1 ? "y" : "ies"} skipped).`,
          type: "success",
        });
      } else {
        showAlertMessage({
          message: "Backup downloaded.",
          type: "success",
        });
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setBackupLoading(false);
    }
  };

  const importFullBackup = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result);
        if (!backup || !Array.isArray(backup.categories)) {
          showAlertMessage({
            message: "This file is not a valid backup JSON.",
            type: "error",
          });
          return;
        }
        setPendingImportBackup(backup);
        setShowImportConfirm(true);
      } catch {
        showAlertMessage({
          message: "This file is not a valid backup JSON.",
          type: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const confirmImportFullBackup = async () => {
    setShowImportConfirm(false);
    if (!pendingImportBackup) return;

    setBackupLoading(true);
    setBackupResultMsg("");
    try {
      const res = await axios.post("manageCategories/backup/api", {
        backup: pendingImportBackup,
      });
      if (res?.data?.success) {
        setBackupResultMsg(res.data.message || "Import complete.");
        showAlertMessage({
          message: res.data.message || "Import complete!",
          type: "success",
        });
        await fetchCategories(false);
      } else {
        showAlertMessage({
          message: res?.data?.message || "Import failed.",
          type: "error",
        });
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setBackupLoading(false);
      setPendingImportBackup(null);
    }
  };

  return (
    <div className={styles.pageWrap}>
      {loading && <Loader />}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        confirmText="Yes, Delete"
        message={
          deleteTarget?.message || "Are you sure you want to delete this?"
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={showImportConfirm}
        title="Import Backup"
        confirmText="Yes, Import"
        message={`This file contains ${pendingImportBackup?.categories?.length || 0
          } category(ies). Any category with a matching name will be REPLACED (the old one deleted, the new one created). All other categories will be left untouched. Continue?`}
        onConfirm={confirmImportFullBackup}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportBackup(null);
        }}
      />

      <div className={styles.adminTabs}>
        <button
          type="button"
          className={`${styles.adminTabBtn} ${adminTab === "content" ? styles.adminTabActive : ""
            }`}
          onClick={() => setAdminTab("content")}
        >
          📂 Content
        </button>
        <button
          type="button"
          className={`${styles.adminTabBtn} ${adminTab === "backup" ? styles.adminTabActive : ""
            }`}
          onClick={() => setAdminTab("backup")}
        >
          🧳 Backup
        </button>
      </div>

      {adminTab === "backup" ? (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>🧳 Full App Backup</p>
          <p
            style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "1rem" }}
          >
            This backs up/restores the entire app&apos;s data (all categories,
            sub-headings, detail cards) as a single JSON file. When you import,
            if the file contains a category with the <strong>same name</strong>{" "}
            as one that already exists, it will be <strong>replaced</strong>{" "}
            (the old one deleted, the new one created) — no duplicates.
            Categories not present in the file (e.g. protected ones) are left
            completely untouched.
          </p>

          <div className={styles.groupButtons}>
            <button
              type="button"
              className={styles.editBtn}
              disabled={backupLoading}
              onClick={downloadFullBackup}
            >
              {backupLoading ? "Please wait..." : "⬇ Download Backup (JSON)"}
            </button>

            <label className={styles.ghostBtn} style={{ cursor: "pointer" }}>
              📥 Import Backup (JSON)
              <input
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={importFullBackup}
                disabled={backupLoading}
              />
            </label>
          </div>

          {backupResultMsg && (
            <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
              ✅ {backupResultMsg}
            </p>
          )}
        </div>
      ) : (
        <>
          { }
          <div className={styles.stepCard}>
            <p className={styles.stepTitle}>
              <span className={styles.stepBadge}>1</span>
              Select a Category (Heading) <UnlockProtected />
            </p>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <select
                className={styles.select}
                style={{ flex: 1 }}
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
              {categoriesLoading && <InlineSpinner />}
            </div>

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
                showCategoryForm
                  ? setShowCategoryForm(false)
                  : openCreateCategory()
              }
            >
              {showCategoryForm ? "▾" : "▸"} + Create a new category
            </button>

            {showCategoryForm && (
              <form
                className={styles.createPanel}
                onSubmit={submitCategoryForm}
              >
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
                  🔒 Protect (if you don&apos;t enter the special code at login,
                  this category won&apos;t show in the dropdown/main page)
                </label>

                {categoryForm.protected && (
                  <div
                    className={styles.inlineRow}
                    style={{ marginTop: "0.5rem" }}
                  >
                    <input
                      type="number"
                      min="1"
                      placeholder="Auto-lock after how many minutes? (leave blank to stay unlocked for the whole session)"
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

          { }
          {selectedCategoryId && (
            <div className={styles.stepCard}>
              <p className={styles.stepTitle}>
                <span className={styles.stepBadge}>2</span>
                Select a Sub Heading inside &quot;
                {selectedCategory?.categoryName}
                &quot;
              </p>

              <select
                className={styles.select}
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
              >
                <option value="">
                  — Select — (Direct cards, no sub heading)
                </option>
                {subcategories.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subcategoryName}
                  </option>
                ))}
              </select>

              {selectedSubcategory && (
                <div className={styles.groupButtons}>
                  <button
                    className={styles.editBtn}
                    onClick={openEditSubcategory}
                  >
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
                {showSubForm ? "▾" : "▸"} + Create a new sub heading inside
                &quot;
                {selectedCategory?.categoryName}&quot;
              </button>

              {showSubForm && (
                <form className={styles.createPanel} onSubmit={submitSubForm}>
                  <input
                    type="text"
                    placeholder="Sub Heading Name (e.g. Section 1, Section 2)"
                    value={subForm.subcategoryName}
                    onChange={(e) =>
                      setSubForm({
                        ...subForm,
                        subcategoryName: e.target.value,
                      })
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

          { }
          {selectedCategoryId && (
            <div className={styles.stepCard}>
              <p className={styles.stepTitle}>
                <span className={styles.stepBadge}>3</span>
                Add a new detail card in &quot;
                {selectedSubcategory?.subcategoryName ||
                  selectedCategory?.categoryName}
                &quot;
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
                  <input
                    type="text"
                    placeholder="Title (e.g. the link's name, shown as clickable text)"
                    value={itemForm.title}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, title: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Subheading (optional)"
                    value={itemForm.subheading}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, subheading: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Detail (optional)"
                    value={itemForm.detail}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, detail: e.target.value })
                    }
                  />

                  <div className={styles.widgetSection}>
                    <button
                      type="button"
                      className={styles.toggleCreate}
                      onClick={() =>
                        setShowAdvancedFeatures((s) => !s)
                      }
                    >
                      {showAdvancedFeatures ? "▾" : "▸"} ⚡ Most Advanced
                      Feature (optional)
                    </button>

                    {showAdvancedFeatures && (
                      <>
                        <p className={styles.widgetGridCaption}>
                          Pick a card type — Table for rows/columns, Tabs for
                          named groups, or both — plus any extra options
                        </p>
                        <div className={styles.checkboxGrid}>
                          {WIDGET_OPTIONS.map((opt) => (
                            <label
                              key={opt.key}
                              className={styles.checkboxItem}
                            >
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
                              <span className={styles.checkboxIcon}>
                                {opt.icon}
                              </span>
                              {opt.label}
                            </label>
                          ))}
                        </div>

                        {itemForm.config.tabs && !itemForm.config.table && (
                          <p
                            style={{
                              fontSize: "0.78rem",
                              opacity: 0.75,
                              margin: "0.4rem 0 0",
                            }}
                          >
                            Each tab always shows as a table now — don&apos;t
                            forget to enable &quot;Table&quot; above and add
                            at least one field/column below, or the tab will
                            have nowhere to put data.
                          </p>
                        )}

                        {itemForm.config.tabs && (
                          <div style={{ marginTop: "0.8rem" }}>
                            <label
                              style={{
                                display: "block",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                marginBottom: "0.3rem",
                              }}
                            >
                              &quot;Add Tab&quot; button label (optional)
                            </label>
                            <input
                              type="text"
                              placeholder='e.g. "+ Add Item" — leave blank to use "+ Add Tab"'
                              value={itemForm.config.addTabButtonLabel || ""}
                              onChange={(e) =>
                                setItemForm({
                                  ...itemForm,
                                  config: {
                                    ...itemForm.config,
                                    addTabButtonLabel: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        )}

                        {itemForm.config.table && (
                          <>
                            <div
                              className={styles.inlineRow}
                              style={{ marginBottom: "0.8rem" }}
                            >
                              <label
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                New rows are added to:
                              </label>
                              <select
                                value={itemForm.config.newRowPosition || "top"}
                                onChange={(e) =>
                                  setItemForm({
                                    ...itemForm,
                                    config: {
                                      ...itemForm.config,
                                      newRowPosition: e.target.value,
                                    },
                                  })
                                }
                              >
                                <option value="top">
                                  ⬆️ Top (latest first)
                                </option>
                                <option value="bottom">
                                  ⬇️ Bottom (oldest first)
                                </option>
                              </select>
                            </div>

                            <div
                              className={styles.widgetGridCaption}
                              style={{ marginTop: "0.8rem" }}
                            >
                              Custom notifications (optional) — leave blank to
                              use the default message
                            </div>
                            <div
                              className={styles.checkboxGrid}
                              style={{ gridTemplateColumns: "1fr" }}
                            >
                              <input
                                type="text"
                                placeholder="Message when a row is added (e.g. Entry added)"
                                value={itemForm.config.messages?.rowAdded || ""}
                                onChange={(e) =>
                                  setItemForm({
                                    ...itemForm,
                                    config: {
                                      ...itemForm.config,
                                      messages: {
                                        ...itemForm.config.messages,
                                        rowAdded: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                              <input
                                type="text"
                                placeholder="Message when a row is updated"
                                value={
                                  itemForm.config.messages?.rowUpdated || ""
                                }
                                onChange={(e) =>
                                  setItemForm({
                                    ...itemForm,
                                    config: {
                                      ...itemForm.config,
                                      messages: {
                                        ...itemForm.config.messages,
                                        rowUpdated: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                              <input
                                type="text"
                                placeholder="Message when a row is deleted"
                                value={
                                  itemForm.config.messages?.rowDeleted || ""
                                }
                                onChange={(e) =>
                                  setItemForm({
                                    ...itemForm,
                                    config: {
                                      ...itemForm.config,
                                      messages: {
                                        ...itemForm.config.messages,
                                        rowDeleted: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className={styles.fieldsBuilder}>
                              <p className={styles.fieldsBuilderLabel}>
                                Table columns / fields (name them anything you
                                like):
                              </p>

                              {itemForm.fields.length > 0 && (
                                <div className={styles.fieldChips}>
                                  {itemForm.fields.map((f, idx) => (
                                    <span
                                      key={f._id || `new-${idx}`}
                                      className={`${styles.fieldChip} ${editingFieldIndex === idx
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
                                  placeholder="Field name (e.g. Name, Date, Amount)"
                                  value={newFieldLabel}
                                  onChange={(e) =>
                                    setNewFieldLabel(e.target.value)
                                  }
                                />
                                <select
                                  value={newFieldType}
                                  onChange={(e) =>
                                    setNewFieldType(e.target.value)
                                  }
                                >
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                  <option value="date">Date</option>
                                  <option value="email">Email</option>
                                  <option value="encrypt">
                                    🔒 Encrypt (stored encrypted in the DB,
                                    shown as plain text in the UI)
                                  </option>
                                  <option value="file">📎 File Upload</option>
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
                                          {
                                            label: newFieldLabel.trim(),
                                            type: newFieldType,
                                          },
                                        ],
                                      });
                                    }
                                    setNewFieldLabel("");
                                    setNewFieldType("text");
                                  }}
                                >
                                  {editingFieldIndex !== null
                                    ? "Update Field"
                                    : "+ Add Field"}
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

          { }
          {selectedCategoryId && (
            <div className={styles.stepCard}>
              <p className={styles.stepTitle}>
                <span className={styles.stepBadge}>4</span>
                Detail cards in &quot;
                {selectedSubcategory?.subcategoryName ||
                  selectedCategory?.categoryName}
                &quot; ({items.length})
              </p>

              {items.length === 0 && (
                <p className={styles.disabledHint}>No cards created yet.</p>
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
                            message:
                              "Are you sure you want to delete this card?",
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
        </>
      )}
    </div>
  );
};

export default CategoryClientWrapper;