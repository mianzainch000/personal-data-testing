import styles from "@/css/Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderWrapper}>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
};

export default Loader;
