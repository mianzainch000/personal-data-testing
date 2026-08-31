"use client";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import ConfirmModal from "@/components/ConfirmModal";
import Button from "@/components/Button";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";
import mr from "@/css/MeterRading.module.css";
import tableStyles from "@/css/Table.module.css";
import styles from "@/css/DynamicDataCard.module.css";

const emptyRowFormFrom = (fields) =>
  Object.fromEntries(fields.map((f) => [String(f._id), ""]));

const DynamicDataCard = ({ item }) => {
  const showAlertMessage = useSnackbar();
  const config = item.config || {};
  const fields = item.fields || [];

  const [tabs, setTabs] = useState(item.tabs || []);
  const [activeTabId, setActiveTabId] = useState(item.tabs?.[0]?._id);

  const [search, setSearch] = useState("");
  const [filterFieldId, setFilterFieldId] = useState("");
  const [filterValue, setFilterValue] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [customOptions, setCustomOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [showRowModal, setShowRowModal] = useState(false);
  const [rowForm, setRowForm] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [fileUploading, setFileUploading] = useState({});

  const [showTabModal, setShowTabModal] = useState(false);
  const [tabNameInput, setTabNameInput] = useState("");
  const [tabDetailInput, setTabDetailInput] = useState("");
  const [tabLinkInput, setTabLinkInput] = useState("");
  const [editingTabId, setEditingTabId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'row' | 'tab', id }
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportWrapRef = useRef(null);
  const importFileRef = useRef(null);
  const [pendingImportTabs, setPendingImportTabs] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // Re-sync local state whenever a different item is rendered.
  useEffect(() => {
    const list = item.tabs || [];
    setTabs(list);
    setActiveTabId(list[0]?._id);
  }, [item._id]);

  useEffect(() => {
    const handler = (e) => {
      if (exportWrapRef.current && !exportWrapRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterFieldId, filterValue, activeTabId, rowsPerPage]);

  const activeTab = tabs.find((t) => t._id === activeTabId) || tabs[0] || null;

  const columns = useMemo(
    () => fields.map((f) => ({ key: String(f._id), label: f.label })),
    [fields],
  );

  const sortedRows = useMemo(() => {
    const rows = activeTab?.rows || [];
    return [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [activeTab]);

  const searchedRows = useMemo(() => {
    if (!config.search || !search.trim()) return sortedRows;
    const q = search.trim().toLowerCase();
    return sortedRows.filter((r) =>
      fields.some((f) =>
        String(r.values?.[String(f._id)] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [sortedRows, search, fields, config.search]);

  const filterOptions = useMemo(() => {
    if (!filterFieldId) return [];
    const set = new Set();
    sortedRows.forEach((r) => {
      const v = r.values?.[filterFieldId];
      if (v !== undefined && v !== null && v !== "") set.add(String(v));
    });
    return Array.from(set).sort();
  }, [sortedRows, filterFieldId]);

  const filteredRows = useMemo(() => {
    if (!config.filter || !filterFieldId || filterValue === "All")
      return searchedRows;
    return searchedRows.filter(
      (r) => String(r.values?.[filterFieldId] ?? "") === filterValue,
    );
  }, [searchedRows, config.filter, filterFieldId, filterValue]);

  const effectiveRowsPerPage = config.pagination ? rowsPerPage : "all";
  const totalPages =
    effectiveRowsPerPage === "all"
      ? filteredRows.length
        ? 1
        : 0
      : Math.ceil(filteredRows.length / effectiveRowsPerPage);

  const pageStartIndex =
    effectiveRowsPerPage === "all"
      ? 0
      : (currentPage - 1) * effectiveRowsPerPage;

  const pageRows =
    effectiveRowsPerPage === "all"
      ? filteredRows
      : filteredRows.slice(pageStartIndex, pageStartIndex + effectiveRowsPerPage);

  const tableData = pageRows.map((r) => {
    const values = { ...(r.values || {}) };
    fields.forEach((f) => {
      if (f.type !== "file") return;
      const key = String(f._id);
      const raw = values[key];
      if (!raw) {
        values[key] = "—";
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        values[key] = (
          <a
            href={`/categories/files/api/${parsed.id}`}
            className={styles.tabLink}
            style={{ margin: 0, fontWeight: 500 }}
          >
            📎 {parsed.name}
          </a>
        );
      } catch {
        values[key] = raw;
      }
    });
    return { _id: r._id, ...values };
  });

  const isSearchOrFilterActive =
    (config.search && Boolean(search.trim())) ||
    (config.filter && Boolean(filterFieldId) && filterValue !== "All");

  // ---------- Persistence ----------
  const persistTabs = async (nextTabs, successMessage) => {
    try {
      const res = await axios.put(`/categories/items/api/${item._id}`, {
        tabs: nextTabs,
      });
      const saved = res?.data?.data?.tabs || nextTabs;
      setTabs(saved);
      showAlertMessage?.({
        message: successMessage || res?.data?.message || "Saved!",
        type: "success",
      });
      return saved;
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage?.({ message, type: "error" });
      return null;
    }
  };

  // ---------- Tabs ----------
  const openAddTab = () => {
    setTabNameInput("");
    setTabDetailInput("");
    setTabLinkInput("");
    setEditingTabId(null);
    setShowTabModal(true);
  };

  const openRenameTab = (tab) => {
    setTabNameInput(tab.tabName || "");
    setTabDetailInput(tab.detail || "");
    setTabLinkInput(tab.link || "");
    setEditingTabId(tab._id);
    setShowTabModal(true);
  };

  const submitTabModal = async (e) => {
    e.preventDefault();
    if (!tabNameInput.trim()) return;

    const tabPatch = {
      tabName: tabNameInput.trim(),
      detail: tabDetailInput.trim(),
      link: tabLinkInput.trim(),
    };

    let nextTabs;
    if (editingTabId) {
      nextTabs = tabs.map((t) =>
        t._id === editingTabId ? { ...t, ...tabPatch } : t,
      );
    } else {
      nextTabs = [...tabs, { ...tabPatch, order: tabs.length, rows: [] }];
    }

    const saved = await persistTabs(
      nextTabs,
      editingTabId ? "Tab updated!" : "Tab added!",
    );
    if (saved) {
      setShowTabModal(false);
      if (!editingTabId) {
        const created = saved[saved.length - 1];
        if (created) setActiveTabId(created._id);
      }
    }
  };

  const confirmDeleteTab = async () => {
    const nextTabs = tabs.filter((t) => t._id !== deleteTarget.id);
    const saved = await persistTabs(nextTabs, "Tab deleted!");
    if (saved) setActiveTabId(saved[0]?._id);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // ---------- Rows ----------
  const openAddRow = () => {
    setRowForm(emptyRowFormFrom(fields));
    setEditingRowId(null);
    setShowRowModal(true);
  };

  const openEditRow = (row) => {
    setRowForm({ ...emptyRowFormFrom(fields), ...(row.values || {}) });
    setEditingRowId(row._id);
    setShowRowModal(true);
  };

  const handleFileFieldChange = async (fieldId, file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showAlertMessage?.({
        message: "File zyada bari hai (max 3MB).",
        type: "error",
      });
      return;
    }

    setFileUploading((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await axios.post("/categories/files/api", {
        fileName: file.name,
        mimeType: file.type,
        dataBase64: base64,
      });

      if (res?.data?.success) {
        setRowForm((prev) => ({
          ...prev,
          [fieldId]: JSON.stringify({
            id: res.data.fileId,
            name: res.data.fileName,
          }),
        }));
      } else {
        showAlertMessage?.({
          message: res?.data?.message || "Upload fail ho gaya.",
          type: "error",
        });
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage?.({ message, type: "error" });
    } finally {
      setFileUploading((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const submitRowModal = async (e) => {
    e.preventDefault();

    // If no tab exists yet (Tabs widget is off, or first row ever), create one implicitly.
    const workingTabs = tabs.length ? tabs : [{ tabName: "", order: 0, rows: [] }];
    const targetTabId = activeTab?._id;

    const nextTabs = workingTabs.map((t, idx) => {
      const isTarget = targetTabId ? t._id === targetTabId : idx === 0;
      if (!isTarget) return t;
      const rows = t.rows || [];
      if (editingRowId) {
        return {
          ...t,
          rows: rows.map((r) =>
            r._id === editingRowId ? { ...r, values: rowForm } : r,
          ),
        };
      }
      return {
        ...t,
        rows: [...rows, { order: rows.length, values: rowForm }],
      };
    });

    const saved = await persistTabs(
      nextTabs,
      editingRowId ? "Row updated!" : "Row added!",
    );
    if (saved) {
      setShowRowModal(false);
      setEditingRowId(null);
      if (!activeTabId) setActiveTabId(saved[0]?._id);
    }
  };

  const confirmDeleteRow = async () => {
    const nextTabs = tabs.map((t) =>
      t._id === activeTab._id
        ? { ...t, rows: (t.rows || []).filter((r) => r._id !== deleteTarget.id) }
        : t,
    );
    await persistTabs(nextTabs, "Row deleted!");
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleReorder = (newPageRows) => {
    if (!activeTab) return;
    const fullRows = [...(activeTab.rows || [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const reorderedIds = newPageRows.map((r) => r._id);
    const replacement = reorderedIds
      .map((id) => fullRows.find((r) => r._id === id))
      .filter(Boolean);
    fullRows.splice(pageStartIndex, replacement.length, ...replacement);
    const withOrder = fullRows.map((r, i) => ({ ...r, order: i }));
    const nextTabs = tabs.map((t) =>
      t._id === activeTab._id ? { ...t, rows: withOrder } : t,
    );
    persistTabs(nextTabs, "Order updated!");
  };

  // ---------- Export ----------
  const fileBaseName = () => {
    const parts = [item.title || "data", activeTab?.tabName].filter(Boolean);
    return parts.join("-").replace(/\s+/g, "_");
  };

  const formatCellForExport = (field, rawValue) => {
    if (field.type === "file" && rawValue) {
      try {
        return JSON.parse(rawValue).name || "";
      } catch {
        return rawValue;
      }
    }
    return rawValue ?? "";
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const title = [item.title, activeTab?.tabName].filter(Boolean).join(" - ");
    if (title) doc.text(title, 14, 14);
    autoTable(doc, {
      startY: title ? 20 : 10,
      head: [fields.map((f) => f.label)],
      body: sortedRows.map((r) =>
        fields.map((f) => formatCellForExport(f, r.values?.[String(f._id)])),
      ),
    });
    doc.save(`${fileBaseName()}.pdf`);
  };

  // ---------- Export/Import backup (full-fidelity, re-importable) ----------
  const exportBackup = () => {
    const backup = {
      type: "personal-data-backup",
      itemTitle: item.title || "",
      exportedAt: new Date().toISOString(),
      fields: fields.map((f) => ({
        id: String(f._id),
        label: f.label,
        type: f.type,
      })),
      tabs: tabs.map((t) => ({
        tabName: t.tabName || "",
        order: t.order ?? 0,
        rows: (t.rows || []).map((r) => ({
          order: r.order ?? 0,
          // key by field label so it survives re-import even into a card
          // whose field _ids differ (e.g. after re-creating the card)
          values: Object.fromEntries(
            fields.map((f) => [f.label, r.values?.[String(f._id)] ?? ""]),
          ),
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBaseName()}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedTabs = Array.isArray(parsed.tabs) ? parsed.tabs : [];

        // Map imported values (keyed by field label) onto this card's current field ids.
        const labelToId = Object.fromEntries(
          fields.map((f) => [f.label.trim().toLowerCase(), String(f._id)]),
        );

        const nextTabs = importedTabs.map((t) => ({
          tabName: t.tabName || "",
          order: t.order ?? 0,
          rows: (t.rows || []).map((r) => {
            const values = {};
            Object.entries(r.values || {}).forEach(([label, val]) => {
              const fid = labelToId[String(label).trim().toLowerCase()];
              if (fid) values[fid] = val;
            });
            return { order: r.order ?? 0, values };
          }),
        }));

        if (!nextTabs.length) {
          showAlertMessage?.({
            message: "Is file mein koi data nahi mila.",
            type: "error",
          });
          return;
        }

        setPendingImportTabs(nextTabs);
        setShowImportConfirm(true);
      } catch {
        showAlertMessage?.({
          message: "Ye file valid backup JSON nahi hai.",
          type: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (pendingImportTabs) {
      const saved = await persistTabs(pendingImportTabs);
      if (saved) setActiveTabId(saved[0]?._id);
    }
    setShowImportConfirm(false);
    setPendingImportTabs(null);
  };

  if (!fields.length) {
    return (
      <p className={styles.emptyHint}>
        Is card ke liye abhi tak koi field (column) nahi banaya. Manage
        Categories mein ja kar table ke fields add karein.
      </p>
    );
  }

  return (
    <div className={mr.container} style={{ maxWidth: "100%", textAlign: "left" }}>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        message={
          deleteTarget?.type === "tab"
            ? "Is tab ke sath uska sara data bhi delete ho jayega. Continue?"
            : "Are you sure you want to delete this row?"
        }
        confirmText="Yes, Delete"
        onConfirm={
          deleteTarget?.type === "tab" ? confirmDeleteTab : confirmDeleteRow
        }
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={showImportConfirm}
        title="Import Restore"
        message="Ye file ka data current tabs ke saath merge karke overwrite kar dega (same naam wale fields match ho jayenge). Continue?"
        confirmText="Yes, Import"
        onConfirm={confirmImport}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportTabs(null);
        }}
      />

      {config.tabs && (
        <div className={styles.addTabRow}>
          <Button variant="primary" onClick={openAddTab}>
            + Add Tab
          </Button>
        </div>
      )}

      {config.tabs && tabs.length > 0 && (
        <div className={mr.tabs}>
          {tabs.map((t) => (
            <div
              key={t._id}
              className={`${mr.tab} ${t._id === activeTabId ? mr.active : ""}`}
              onClick={() => setActiveTabId(t._id)}
            >
              <span>{t.tabName || "Untitled"}</span>
              <span
                className={styles.tabIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  openRenameTab(t);
                }}
                title="Rename"
              >
                ✏️
              </span>
              <span
                className={styles.tabIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({ type: "tab", id: t._id });
                  setShowDeleteModal(true);
                }}
                title="Delete"
              >
                🗑️
              </span>
            </div>
          ))}
        </div>
      )}

      {config.tabs && tabs.length === 0 && (
        <p className={styles.emptyHint}>
          Abhi tak koi tab nahi hai. Data add karne ke liye upar{" "}
          <strong>+ Add Tab</strong> par click karein (jaise &quot;Meter
          1&quot;).
        </p>
      )}

      {!config.tabs || activeTab ? (
        <>
          {activeTab && (activeTab.detail || activeTab.link) && (
            <div className={mr.consumerInfo}>
              {activeTab.detail && (
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {activeTab.detail}
                </p>
              )}
              {activeTab.link && (
                <a
                  href={activeTab.link}
                  className={styles.tabLink}
                >
                  🔗 {activeTab.link}
                </a>
              )}
            </div>
          )}

          <div className={mr.buttonGroup}>
            {(config.pdf || config.exportJson) && (
              <div
                className={tableStyles.splitButtonContainer}
                ref={exportWrapRef}
              >
                <Button
                  variant="ghost"
                  onClick={() => setShowExportMenu((s) => !s)}
                >
                  ⬇ Options ▾
                </Button>
                {showExportMenu && (
                  <div className={tableStyles.dropdownMenu}>
                    {config.pdf && (
                      <div
                        className={tableStyles.dropdownItem}
                        onClick={() => {
                          exportPdf();
                          setShowExportMenu(false);
                        }}
                      >
                        📄 PDF Report
                      </div>
                    )}
                    {config.exportJson && (
                      <div
                        className={tableStyles.dropdownItem}
                        onClick={() => {
                          exportBackup();
                          setShowExportMenu(false);
                        }}
                      >
                        🧳 Export Backup
                      </div>
                    )}
                    {config.exportJson && (
                      <div
                        className={tableStyles.dropdownItem}
                        onClick={() => {
                          setShowExportMenu(false);
                          importFileRef.current?.click();
                        }}
                      >
                        📥 Import Backup
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: "none" }}
                  onChange={handleImportFile}
                />
              </div>
            )}

            <Button variant="primary" onClick={openAddRow}>
              + Add Row
            </Button>
          </div>

          {(config.search || config.filter) && (
            <div className={mr.filters}>
              {config.search && (
                <input
                  type="text"
                  className={mr.filterInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                />
              )}

              {config.filter && (
                <>
                  <select
                    value={filterFieldId}
                    onChange={(e) => {
                      setFilterFieldId(e.target.value);
                      setFilterValue("All");
                    }}
                    className={mr.filterSelect}
                  >
                    <option value="">Filter by…</option>
                    {fields.map((f) => (
                      <option key={f._id} value={String(f._id)}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  {filterFieldId && (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className={mr.filterSelect}
                    >
                      <option value="All">All</option>
                      {filterOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
          )}

          <Table
            columns={columns}
            data={tableData}
            onReorder={config.dragDrop ? handleReorder : undefined}
            dragEnabled={Boolean(config.dragDrop)}
            isSearchActive={isSearchOrFilterActive}
            emptyMessage="Koi data nahi hai. + Add Row se shuru karein."
            renderActions={(row) => (
              <>
                <span
                  onClick={() =>
                    openEditRow(pageRows.find((r) => r._id === row._id))
                  }
                  title="Edit"
                >
                  ✏️
                </span>
                <span
                  onClick={() => {
                    setDeleteTarget({ type: "row", id: row._id });
                    setShowDeleteModal(true);
                  }}
                  title="Delete"
                >
                  🗑️
                </span>
              </>
            )}
          />

          {config.pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
              customOptions={customOptions}
              onCustomOptionsChange={setCustomOptions}
              totalItems={filteredRows.length}
            />
          )}
        </>
      ) : null}

      {/* Add / Edit Row modal */}
      {showRowModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={styles.modalOverlay} onClick={() => setShowRowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowRowModal(false)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>
                {editingRowId
                  ? "Edit Row"
                  : `Add Row${activeTab?.tabName ? " – " + activeTab.tabName : ""}`}
              </h3>
              <form onSubmit={submitRowModal} className={styles.modalForm}>
                {fields.map((f) => (
                  <div key={f._id} className={styles.modalField}>
                    <label>
                      {f.type === "encrypt" && "🔒 "}
                      {f.type === "file" && "📎 "}
                      {f.label}
                    </label>
                    {f.type === "file" ? (
                      <>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileFieldChange(
                              String(f._id),
                              e.target.files?.[0],
                            )
                          }
                        />
                        {fileUploading[String(f._id)] && (
                          <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                            Upload ho raha hai...
                          </span>
                        )}
                        {!fileUploading[String(f._id)] &&
                          rowForm[String(f._id)] && (
                            <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                              ✅{" "}
                              {(() => {
                                try {
                                  return JSON.parse(rowForm[String(f._id)])
                                    .name;
                                } catch {
                                  return "";
                                }
                              })()}
                            </span>
                          )}
                      </>
                    ) : (
                      <input
                        type={
                          f.type === "number"
                            ? "number"
                            : f.type === "date"
                              ? "date"
                              : f.type === "email"
                                ? "email"
                                : "text"
                        }
                        value={rowForm[String(f._id)] ?? ""}
                        onChange={(e) =>
                          setRowForm({
                            ...rowForm,
                            [String(f._id)]: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                ))}
                <button type="submit" className={styles.modalSubmit}>
                  Submit
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Add / Rename Tab modal */}
      {showTabModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={styles.modalOverlay} onClick={() => setShowTabModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowTabModal(false)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>
                {editingTabId ? "Rename Tab" : "Add Tab"}
              </h3>
              <form onSubmit={submitTabModal} className={styles.modalForm}>
                <div className={styles.modalField}>
                  <label>Tab Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={tabNameInput}
                    onChange={(e) => setTabNameInput(e.target.value)}
                    placeholder="e.g. Meter 1"
                  />
                </div>
                <div className={styles.modalField}>
                  <label>Detail (optional — is tab ke liye alag note)</label>
                  <textarea
                    rows={3}
                    value={tabDetailInput}
                    onChange={(e) => setTabDetailInput(e.target.value)}
                    placeholder="e.g. Consumer ID: 1234567890"
                  />
                </div>
                <div className={styles.modalField}>
                  <label>Website Link (optional)</label>
                  <input
                    type="text"
                    value={tabLinkInput}
                    onChange={(e) => setTabLinkInput(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <button type="submit" className={styles.modalSubmit}>
                  Submit
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DynamicDataCard;
