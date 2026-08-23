import styles from "@/css/Table.module.css";
import React, { useState, useEffect } from "react";
import SortableRow from "@/components/SortableRow";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";

const Table = ({
  columns,
  data,
  onReorder,
  renderActions,
  emptyMessage = "No results found",
  isSearchActive = false,
}) => {
  const [items, setItems] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (Array.isArray(data)) setItems(data);
  }, [data]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    setItems(newItems);

    if (onReorder) onReorder(newItems);
  };

  return (
    <div className={styles.tableWrapper}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th
                className={`${styles.th} ${styles.hideOnMobile}`}
                style={{ width: "50px" }}
              >
                Drag
              </th>
              {columns.map((col) => (
                <th key={col.key} className={styles.th}>
                  {col.label}
                </th>
              ))}
              {renderActions && <th className={styles.th}>Actions</th>}
            </tr>
          </thead>
          {}
          <SortableContext
            items={items.map((i) => i._id)}
            strategy={verticalListSortingStrategy}
            disabled={isSearchActive}
          >
            <tbody>
              {items.length > 0 ? (
                items.map((row) => (
                  <SortableRow
                    key={row._id}
                    row={row}
                    columns={columns}
                    renderActions={renderActions}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    style={{ textAlign: "center" }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
};
export default Table;
