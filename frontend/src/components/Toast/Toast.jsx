import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import styles from "./Toast.module.css";

export function Toast({ message, type = "success", onClose }) {
    const [leaving, setLeaving] = useState(false);

    function handleClose() {
        setLeaving(true);
        setTimeout(onClose, 300);
    }

    useEffect(() => {
        const timer = setTimeout(handleClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${styles.toast} ${styles[type]} ${leaving ? styles.leaving : ""}`}>
            {type === "success" 
                ? <CheckCircle size={18} /> 
                : <XCircle size={18} />
            }
            <span>{message}</span>
            <button className={styles.closeBtn} onClick={handleClose}>
                <X size={16} />
            </button>
        </div>
    );
}