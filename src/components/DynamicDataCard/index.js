"use client";
import axios from "axios";
import jsPDF from "jspdf";
import Table from "@/components/Table";
import autoTable from "jspdf-autotable";
import { createPortal } from "react-dom";
import Button from "@/components/Button";
import mr from "@/css/MeterRading.module.css";
import Pagination from "@/components/Pagination";
import tableStyles from "@/css/Table.module.css";
import { useSnackbar } from "@/components/Snackbar";
import { getCookie, setCookie } from "cookies-next";
import ConfirmModal from "@/components/ConfirmModal";
import styles from "@/css/DynamicDataCard.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import handleAxiosError from "@/components/HandleAxiosError";

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
  const [rowsPerPage, setRowsPerPage] = useState(
    item.config?.paginationRowsPerPage ?? "all",
  );
  const [customOptions, setCustomOptions] = useState(
    item.config?.paginationCustomOptions || [],
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [showRowModal, setShowRowModal] = useState(false);
  const [rowForm, setRowForm] = useState({});
  const [editingRowId, setEditingRowId] = useState(null);
  const [fileUploading, setFileUploading] = useState({});
  const [submittingRow, setSubmittingRow] = useState(false);
  const [submittingTab, setSubmittingTab] = useState(false);

  const [showTabModal, setShowTabModal] = useState(false);
  const [tabNameInput, setTabNameInput] = useState("");
  const [tabDetailInputs, setTabDetailInputs] = useState([""]);
  const [tabLinkTitleInput, setTabLinkTitleInput] = useState("");
  const [tabLinkUrlInput, setTabLinkUrlInput] = useState("");
  const [editingTabId, setEditingTabId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportWrapRef = useRef(null);
  const importFileRef = useRef(null);
  const [pendingImportTabs, setPendingImportTabs] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  useEffect(() => {
    const list = item.tabs || [];
    setTabs(list);
    const savedTabId = getCookie(`activeTab_${item._id}`);
    const isSavedValid = savedTabId && list.some((t) => t._id === savedTabId);
    setActiveTabId(isSavedValid ? savedTabId : list[0]?._id);
  }, [item._id]);

  const selectTab = (tabId) => {
    setActiveTabId(tabId);
    if (item._id && tabId)
      setCookie(`activeTab_${item._id}`, tabId, {
        maxAge: 60 * 60 * 24 * 365,
      });
  };

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
      : filteredRows.slice(
          pageStartIndex,
          pageStartIndex + effectiveRowsPerPage,
        );

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

  const persistPaginationConfig = async (newRowsPerPage, newCustomOptions) => {
    try {
      await axios.put(`/categories/items/api/${item._id}`, {
        config: {
          ...config,
          paginationRowsPerPage: newRowsPerPage,
          paginationCustomOptions: newCustomOptions,
        },
      });
    } catch {}
  };

  const handleRowsPerPageChange = (val) => {
    setRowsPerPage(val);
    persistPaginationConfig(val, customOptions);
  };

  const handleCustomOptionsChange = (opts) => {
    setCustomOptions(opts);
    persistPaginationConfig(rowsPerPage, opts);
  };

  const openAddTab = () => {
    setTabNameInput("");
    setTabDetailInputs([""]);
    setTabLinkTitleInput("");
    setTabLinkUrlInput("");
    setEditingTabId(null);
    setShowTabModal(true);
  };

  const openRenameTab = (tab) => {
    setTabNameInput(tab.tabName || "");
    setTabDetailInputs(tab.detail ? tab.detail.split("\n") : [""]);
    setTabLinkTitleInput(tab.linkTitle || "");
    setTabLinkUrlInput(tab.link || "");
    setEditingTabId(tab._id);
    setShowTabModal(true);
  };

  const submitTabModal = async (e) => {
    e.preventDefault();
    if (!tabNameInput.trim() || submittingTab) return;
    setSubmittingTab(true);

    const tabPatch = {
      tabName: tabNameInput.trim(),
      detail: tabDetailInputs
        .map((d) => d.trim())
        .filter(Boolean)
        .join("\n"),
      linkTitle: tabLinkTitleInput.trim(),
      link: tabLinkUrlInput.trim(),
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
    setSubmittingTab(false);
    if (saved) {
      setShowTabModal(false);
      if (!editingTabId) {
        const created = saved[saved.length - 1];
        if (created) selectTab(created._id);
      }
    }
  };

  const confirmDeleteTab = async () => {
    const nextTabs = tabs.filter((t) => t._id !== deleteTarget.id);
    const saved = await persistTabs(nextTabs, "Tab deleted!");
    if (saved) selectTab(saved[0]?._id);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

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
        message: "File is too large (max 3MB).",
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
    if (submittingRow) return;
    setSubmittingRow(true);

    const workingTabs = tabs.length
      ? tabs
      : [{ tabName: "", order: 0, rows: [] }];
    const targetTabId = activeTab?._id;
    const addToTop = (config.newRowPosition || "top") !== "bottom";

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
      const newRow = { values: rowForm };
      const newRows = addToTop
        ? [newRow, ...rows].map((r, i) => ({ ...r, order: i }))
        : [...rows, { ...newRow, order: rows.length }];
      return { ...t, rows: newRows };
    });

    const defaultAddMessage = addToTop
      ? "Row added to top!"
      : "Row added to bottom!";
    const successMessage = editingRowId
      ? config.messages?.rowUpdated || "Row updated!"
      : config.messages?.rowAdded || defaultAddMessage;

    const saved = await persistTabs(nextTabs, successMessage);
    setSubmittingRow(false);
    if (saved) {
      setShowRowModal(false);
      setEditingRowId(null);
      if (!activeTabId) selectTab(saved[0]?._id);
    }
  };

  const confirmDeleteRow = async () => {
    const nextTabs = tabs.map((t) =>
      t._id === activeTab._id
        ? {
            ...t,
            rows: (t.rows || []).filter((r) => r._id !== deleteTarget.id),
          }
        : t,
    );
    await persistTabs(nextTabs, config.messages?.rowDeleted || "Row deleted!");
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
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedTabs = Array.isArray(parsed.tabs) ? parsed.tabs : [];

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
            message: "No data found in this file.",
            type: "error",
          });
          return;
        }

        setPendingImportTabs(nextTabs);
        setShowImportConfirm(true);
      } catch {
        showAlertMessage?.({
          message: "This file is not a valid backup JSON.",
          type: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (pendingImportTabs) {
      const saved = await persistTabs(pendingImportTabs);
      if (saved) selectTab(saved[0]?._id);
    }
    setShowImportConfirm(false);
    setPendingImportTabs(null);
  };

  if (!fields.length) {
    return (
      <p className={styles.emptyHint}>
        This card doesn&apos;t have any fields (columns) yet. Go to Manage
        Categories to add table fields.
      </p>
    );
  }

  return (
    <div
      className={mr.container}
      style={{ maxWidth: "100%", textAlign: "left" }}
    >
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        message={
          deleteTarget?.type === "tab"
            ? "Deleting this tab will also delete all of its data. Continue?"
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
        message="This file's data will be merged with the current tabs, overwriting fields with matching names. Continue?"
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
            {config.addTabButtonLabel?.trim() || "+ Add Tab"}
          </Button>
        </div>
      )}

      {config.tabs && tabs.length > 0 && (
        <div className={mr.tabs}>
          {tabs.map((t) => (
            <div
              key={t._id}
              className={`${mr.tab} ${t._id === activeTabId ? mr.active : ""}`}
              onClick={() => selectTab(t._id)}
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
          No tabs yet. Click{" "}
          <strong>{config.addTabButtonLabel?.trim() || "+ Add Tab"}</strong>{" "}
          above to add data (e.g. &quot;Item 1&quot;).
        </p>
      )}

      {!config.tabs || activeTab ? (
        <>
          {activeTab &&
            (activeTab.detail || activeTab.link || activeTab.linkTitle) && (
              <div className={mr.consumerInfo} style={{ textAlign: "center" }}>
                {activeTab.detail && (
                  <p
                    style={{ margin: 0, whiteSpace: "pre-wrap" }}
                    className={styles.tabDetailText}
                  >
                    {activeTab.detail}
                  </p>
                )}
                {activeTab.link ? (
                  <a
                    href={activeTab.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tabLink}
                    style={{ display: "inline-block" }}
                  >
                    🔗 {activeTab.linkTitle || "Visit Link"}
                  </a>
                ) : (
                  activeTab.linkTitle && (
                    <p style={{ margin: 0 }} className={styles.tabDetailText}>
                      {activeTab.linkTitle}
                    </p>
                  )
                )}
              </div>
            )}

          {}
          <>
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
              emptyMessage="No data yet. Click + Add Row to get started."
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
                onRowsPerPageChange={handleRowsPerPageChange}
                customOptions={customOptions}
                onCustomOptionsChange={handleCustomOptionsChange}
                totalItems={filteredRows.length}
              />
            )}
          </>
        </>
      ) : null}

      {}
      {showRowModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.modalOverlay}
            onClick={() => setShowRowModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {editingRowId
                    ? "Edit Row"
                    : `Add Row${activeTab?.tabName ? " – " + activeTab.tabName : ""}`}
                </h3>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setShowRowModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
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
                              Uploading...
                            </span>
                          )}
                          {!fileUploading[String(f._id)] &&
                            rowForm[String(f._id)] && (
                              <span
                                style={{ fontSize: "0.8rem", opacity: 0.8 }}
                              >
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
                  <button
                    type="submit"
                    className={styles.modalSubmit}
                    disabled={submittingRow}
                  >
                    {submittingRow ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {}
      {showTabModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.modalOverlay}
            onClick={() => setShowTabModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {editingTabId ? "Rename Tab" : "Add Tab"}
                </h3>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setShowTabModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <form onSubmit={submitTabModal} className={styles.modalForm}>
                  <div className={styles.modalField}>
                    <label>Tab Name</label>
                    <input
                      type="text"
                      autoFocus
                      value={tabNameInput}
                      onChange={(e) => setTabNameInput(e.target.value)}
                      placeholder="e.g. Item 1"
                    />
                  </div>
                  <div className={styles.modalField}>
                    <label>
                      Detail (optional — add as many notes as you need)
                    </label>
                    {tabDetailInputs.map((val, idx) => (
                      <div key={idx} className={styles.detailInputRow}>
                        <textarea
                          rows={2}
                          value={val}
                          onChange={(e) =>
                            setTabDetailInputs((prev) =>
                              prev.map((d, i) =>
                                i === idx ? e.target.value : d,
                              ),
                            )
                          }
                          placeholder="e.g. Add any notes here"
                        />
                        {tabDetailInputs.length > 1 && (
                          <button
                            type="button"
                            className={styles.detailRemoveBtn}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() =>
                              setTabDetailInputs((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            title="Remove this detail"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className={styles.addDetailBtn}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        setTabDetailInputs((prev) => [...prev, ""])
                      }
                    >
                      + Add Detail
                    </button>
                  </div>
                  <div className={styles.modalField}>
                    <label>Link Name (optional)</label>
                    <input
                      type="text"
                      value={tabLinkTitleInput}
                      onChange={(e) => setTabLinkTitleInput(e.target.value)}
                      placeholder="e.g. Visit Website"
                    />
                  </div>
                  <div className={styles.modalField}>
                    <label>Link URL (optional)</label>
                    <input
                      type="text"
                      value={tabLinkUrlInput}
                      onChange={(e) => setTabLinkUrlInput(e.target.value)}
                      placeholder="https://..."
                    />
                    <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                      Name only shows as plain text. Add a URL here and the name
                      becomes a clickable &quot;Visit Link&quot;.
                    </span>
                  </div>
                  <button
                    type="submit"
                    className={styles.modalSubmit}
                    disabled={submittingTab}
                  >
                    {submittingTab ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DynamicDataCard;
