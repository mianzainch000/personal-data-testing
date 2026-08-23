"use client";
import React from "react";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/css/Table.module.css";
import { useSortable } from "@dnd-kit/sortable";

const SortableRow = ({ row, columns, renderActions }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 999 : 1,
    position: "relative",
  };

  return (
    <tr ref={setNodeRef} style={style} className={styles.tr}>
      {}
      <td
        className={`${styles.td} ${styles.hideOnMobile}`}
        {...attributes}
        {...listeners}
        style={{ cursor: "grab" }}
      >
        ⠿
      </td>

      {}
      {columns.map((col) => (
        <td key={col.key} className={styles.td} data-label={col.label}>
          {row[col.key]}
        </td>
      ))}

      {}
      {renderActions && (
        <td className={styles.td} data-label="Actions">
          <div className={styles.tdActions}>{renderActions(row)}</div>
        </td>
      )}
    </tr>
  );
};

export default SortableRow;
