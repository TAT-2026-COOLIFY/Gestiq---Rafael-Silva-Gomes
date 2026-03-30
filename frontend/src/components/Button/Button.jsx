import styles from "./Button.module.css";

export function Button({
  children,
  type = "button",
  onClick,
  disabled,
  className,
}) {
  return (
    <button
      type={type}
      className={`${styles.baseButton} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
