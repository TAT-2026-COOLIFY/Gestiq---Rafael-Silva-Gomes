import { X } from "lucide-react"
import styles from "./Drawer.module.css"

export function Drawer({ title, subtitle, onClose, children, footer }) {
    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h3>{title}</h3>
                        {subtitle && (
                            <span className={styles.subtitle}>{subtitle}</span>
                        )}
                    </div>
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
        </>
    );
}