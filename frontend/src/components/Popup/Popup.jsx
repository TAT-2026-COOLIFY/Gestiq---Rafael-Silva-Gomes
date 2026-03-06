import { useState, useEffect, useCallback } from "react";
import { TriangleAlert } from "lucide-react";
import styles from "./Popup.module.css"

export function Popup({ message, onClose, action}) {
    const [leaving, setLeaving] = useState(false)
    
    const handleClose = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onClose(), 300);
    }, [onClose]);

    useEffect(() => {
        if(action) return;
    }, [handleClose, action]);

    return (
        <div className={`${styles.overlay} ${leaving ? styles.leaving : ""}`}>
            <div className={`${styles.popup} ${leaving ? styles.leaving : ""}`}>
                <TriangleAlert size={60} className={styles.icon} />
                <span className={styles.alert}>ATENÇÃO</span>
                <span className={styles.message}>{message}</span>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={action}>
                        Sim
                    </button>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        Não
                    </button>
                </div>
            </div>
        </div>
        
    );
}