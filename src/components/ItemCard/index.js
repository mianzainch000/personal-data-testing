"use client";
import styles from "@/css/ItemCard.module.css";

const ItemCard = ({ item }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        {item.title && <p className={styles.title}>{item.title}</p>}
        {item.subheading && (
          <p className={styles.subheading}>{item.subheading}</p>
        )}
        {item.detail && <p className={styles.detail}>{item.detail}</p>}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            🔗 Open Link
          </a>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
