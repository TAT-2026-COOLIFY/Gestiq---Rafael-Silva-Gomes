import { motion } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Drawer.module.css";

export function Drawer({ title, subtitle, onClose, children, footer }) {
  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.overlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className={styles.drawer}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
      >
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h3>{title}</h3>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </motion.div>
    </div>
  );
}
