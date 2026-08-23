import styles from "@/css/Button.module.css";

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const buttonClass = `${styles.customBtn} ${styles[variant]} ${className}`;
  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
