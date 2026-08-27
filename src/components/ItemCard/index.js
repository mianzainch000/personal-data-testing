"use client";
import styles from "@/css/ItemCard.module.css";
import DynamicDataCard from "@/components/DynamicDataCard";

const ItemCard = ({ item }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.title} ${styles.titleLink}`}
          >
            {item.title || item.link}
          </a>
        ) : (
          item.title && <p className={styles.title}>{item.title}</p>
        )}
        {item.subheading && (
          <p className={styles.subheading}>{item.subheading}</p>
        )}
        {item.detail && <p className={styles.detail}>{item.detail}</p>}
        {item.config?.table && <DynamicDataCard item={item} />}
      </div>
    </div>
  );
};

export default ItemCard;
