import styles from "@/css/InlineSpinner.module.css";

const InlineSpinner = ({ size = 16 }) => {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
};

export default InlineSpinner;
