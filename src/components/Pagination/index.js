"use client";
import styles from "@/css/MeterRading.module.css";
import { useState, useEffect, useRef } from "react";

const RowsPerPageControl = ({
  rowsPerPage,
  onRowsPerPageChange,
  customOptions = [],
  onCustomOptionsChange,
  onOptionsAndRowsChange,
  totalItems,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [editingValue, setEditingValue] = useState(null);
  const [editValue, setEditValue] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        setAddMode(false);
        setEditingValue(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!showDropdown && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = 260;
      setOpenUpward(
        spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight,
      );
    }
    setShowDropdown((s) => !s);
  };

  const displayLabel = rowsPerPage === "all" ? "All" : `${rowsPerPage} Rows`;

  const selectOption = (val) => {
    onRowsPerPageChange(val);
    setShowDropdown(false);
    setAddMode(false);
    setEditingValue(null);
  };

  const confirmAdd = () => {
    const num = parseInt(addValue, 10);
    if (!num || num < 1) return;
    const updated = customOptions.includes(num)
      ? customOptions
      : [...customOptions, num].sort((a, b) => a - b);

    if (onOptionsAndRowsChange) {
      onOptionsAndRowsChange({ customOptions: updated, rowsPerPage: num });
    } else {
      onCustomOptionsChange?.(updated);
      onRowsPerPageChange(num);
    }

    setAddValue("");
    setAddMode(false);
    setShowDropdown(false);
  };

  const startEdit = (val, e) => {
    e.stopPropagation();
    setEditingValue(val);
    setEditValue(String(val));
  };

  const confirmEdit = (oldVal) => {
    const num = parseInt(editValue, 10);
    if (!num || num < 1) return;
    if (num !== oldVal && customOptions.includes(num)) {
      setEditingValue(null);
      return;
    }
    const updated = customOptions
      .map((v) => (v === oldVal ? num : v))
      .sort((a, b) => a - b);

    if (rowsPerPage === oldVal && onOptionsAndRowsChange) {
      onOptionsAndRowsChange({ customOptions: updated, rowsPerPage: num });
    } else {
      onCustomOptionsChange?.(updated);
      if (rowsPerPage === oldVal) onRowsPerPageChange(num);
    }
    setEditingValue(null);
  };

  const removeOption = (val, e) => {
    e.stopPropagation();
    const updated = customOptions.filter((v) => v !== val);

    if (rowsPerPage === val && onOptionsAndRowsChange) {
      onOptionsAndRowsChange({ customOptions: updated, rowsPerPage: "all" });
    } else {
      onCustomOptionsChange?.(updated);
      if (rowsPerPage === val) onRowsPerPageChange("all");
    }
  };

  return (
    <div className={styles.rowsControl}>
      <label className={styles.rowsLabel} htmlFor="rowsPerPageSelect">
        Rows per page
      </label>
      <div className={styles.customDropdownWrapper} ref={wrapperRef}>
        <button
          type="button"
          id="rowsPerPageSelect"
          className={styles.customDropdownToggle}
          onClick={toggleDropdown}
        >
          {displayLabel} {showDropdown ? "▲" : "▼"}
        </button>

        {showDropdown && (
          <ul
            className={`${styles.customDropdownMenu} ${openUpward ? styles.openUp : ""}`}
          >
            <li
              onClick={() => selectOption("all")}
              className={`${styles.optionRow} ${rowsPerPage === "all" ? styles.optionActive : ""}`}
            >
              All
            </li>

            {customOptions.map((opt) =>
              editingValue === opt ? (
                <li key={opt} className={styles.optionEditRow}>
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit(opt);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.inlineInput}
                  />
                  <button
                    type="button"
                    onClick={() => confirmEdit(opt)}
                    className={styles.inlineOkBtn}
                  >
                    OK
                  </button>
                </li>
              ) : (
                <li
                  key={opt}
                  onClick={() => selectOption(opt)}
                  className={`${styles.optionRow} ${rowsPerPage === opt ? styles.optionActive : ""}`}
                >
                  <span>{opt} Rows</span>
                  <span className={styles.optionIcons}>
                    <span
                      onClick={(e) => startEdit(opt, e)}
                      className={styles.optionIconBtn}
                      title="Edit"
                    >
                      ✏️
                    </span>
                    <span
                      onClick={(e) => removeOption(opt, e)}
                      className={styles.optionIconBtn}
                      title="Remove"
                    >
                      ✕
                    </span>
                  </span>
                </li>
              ),
            )}

            <li className={styles.addRow}>
              {addMode ? (
                <>
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    placeholder="e.g. 15"
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAdd();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.inlineInput}
                  />
                  <button
                    type="button"
                    onClick={confirmAdd}
                    className={styles.inlineOkBtn}
                  >
                    OK
                  </button>
                </>
              ) : (
                <span
                  onClick={() => setAddMode(true)}
                  className={styles.addRowLabel}
                >
                  + Add Custom
                </span>
              )}
            </li>
          </ul>
        )}
      </div>

      {typeof totalItems === "number" && (
        <span className={styles.rowsTotal}>{totalItems} total</span>
      )}
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  windowSize = 3,
  rowsPerPage,
  onRowsPerPageChange,
  customOptions,
  onCustomOptionsChange,
  onOptionsAndRowsChange,
  totalItems,
}) => {
  const showRowsControl = typeof onRowsPerPageChange === "function";

  if (totalPages < 1) {
    if (!showRowsControl) return null;
    return (
      <div className={styles.paginationWrap}>
        <RowsPerPageControl
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          customOptions={customOptions}
          onCustomOptionsChange={onCustomOptionsChange}
          onOptionsAndRowsChange={onOptionsAndRowsChange}
          totalItems={totalItems}
        />
      </div>
    );
  }

  const pageNumbers = [];

  pageNumbers.push(1);

  let start = 2;
  let end = Math.min(totalPages - 1, windowSize + 1);

  if (currentPage > windowSize) {
    start = currentPage - 1;
    end = currentPage + 1;
  }

  for (let i = start; i <= end; i++) {
    if (i > 1 && i < totalPages) {
      pageNumbers.push(i);
    }
  }

  if (end < totalPages - 1) {
    pageNumbers.push("...");
  }

  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  return (
    <div className={styles.paginationWrap}>
      <div className={styles.pagination}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.pageBtn}
        >
          Prev
        </button>

        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span
              key={idx}
              className={styles.pageBtn}
              style={{ cursor: "default" }}
            >
              ...
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`${styles.pageBtn} ${
                currentPage === page ? styles.activePage : ""
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.pageBtn}
        >
          Next
        </button>
      </div>

      {showRowsControl && (
        <RowsPerPageControl
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          customOptions={customOptions}
          onCustomOptionsChange={onCustomOptionsChange}
          onOptionsAndRowsChange={onOptionsAndRowsChange}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default Pagination;
