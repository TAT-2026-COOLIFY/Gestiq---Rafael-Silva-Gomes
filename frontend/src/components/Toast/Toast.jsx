import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Toast.module.css";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

export function Toast({ message, type = "error", onClose, action }) {
  useEffect(() => {
    if (action) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose, action]);

  const Icon = ICONS[type] ?? AlertCircle;

  function handleAction() {
    if (action?.onClick) action.onClick();
    onClose();
  }

  return (
    <motion.div
      className={`${styles.toast} ${styles[type]}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      layout
    >
      <Icon size={18} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <div className={styles.actions}>
        {action && (
          <button className={styles.actionBtn} onClick={handleAction}>
            {action.label}
          </button>
        )}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
