import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import styles from "./Popup.module.css";

export function Popup({ message, onClose, action }) {
  function handleConfirm() {
    action();
    onClose();
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.popup}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <TriangleAlert size={60} className={styles.icon} />
        <span className={styles.alert}>ATENÇÃO</span>
        <span className={styles.message}>{message}</span>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleConfirm}>
            Sim
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            Não
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
