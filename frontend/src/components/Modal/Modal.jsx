import { X } from "lucide-react";
import styles from "./Modal.module.css";

export function Modal({ title, onClose, children, footer, maxWidth = 860 }) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h3>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    {children}
                </div>

                {footer && (
                    <div className={styles.footer}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}