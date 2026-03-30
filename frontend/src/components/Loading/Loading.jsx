import styles from "./Loading.module.css";

export function Loading({ size = 36 }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} style={{ width: size, height: size }} />
    </div>
  );
}
