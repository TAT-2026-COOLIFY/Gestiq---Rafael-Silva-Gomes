import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Toast.module.css";

const ICONS = {
    success: CheckCircle,
    error:   AlertCircle,
    info:    Info,
};

export function Toast({ message, type = "error", onClose, action }) {
    const [leaving, setLeaving] = useState(false);

    const handleClose = useCallback(() => {
        setLeaving(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    useEffect(() => {
        if (action) return;
        const timer = setTimeout(handleClose, 3500);
        return () => clearTimeout(timer);
    }, [handleClose, action]);

    const Icon = ICONS[type] ?? AlertCircle;

    function handleAction() {
        handleClose();
        if (action?.onClick) action.onClick();
    }

    return (
        <div className={`${styles.toast} ${styles[type]} ${leaving ? styles.leaving : ""}`}>
            <Icon size={18} className={styles.icon} />
            <span className={styles.message}>{message}</span>
            <div className={styles.actions}>
                {action && (
                    <button className={styles.actionBtn} onClick={handleAction}>
                        {action.label}
                    </button>
                )}
                <button className={styles.closeBtn} onClick={handleClose}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}