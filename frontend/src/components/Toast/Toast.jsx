import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import styles from "./Toast.module.css";

export function Toast({ message, type = "success", onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            {type === "success" 
                ? <CheckCircle size={18} /> 
                : <XCircle size={18} />
            }
            <span>{message}</span>
            <button className={styles.closeBtn} onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
}