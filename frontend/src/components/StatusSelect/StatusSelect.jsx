import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./StatusSelect.module.css";

const STATUS_OPTIONS = [
  {
    value: "PLAN",
    label: "A INICIAR",
    badge: styles.statusPlan,
    dot: styles.dotPlan,
    text: styles.optionPlan,
  },
  {
    value: "ACTIVE",
    label: "EM ANDAMENTO",
    badge: styles.statusActive,
    dot: styles.dotActive,
    text: styles.optionActive,
  },
  {
    value: "VALID",
    label: "EM VALIDAÇÃO",
    badge: styles.statusValid,
    dot: styles.dotValid,
    text: styles.optionValid,
  },
  {
    value: "MONIT",
    label: "EM MONITORAMENTO",
    badge: styles.statusMonit,
    dot: styles.dotMonit,
    text: styles.optionMonit,
  },
  {
    value: "DELAY",
    label: "EM ATRASO",
    badge: styles.statusDelay,
    dot: styles.dotDelay,
    text: styles.optionDelay,
  },
  {
    value: "CONC",
    label: "CONCLUÍDO",
    badge: styles.statusConc,
    dot: styles.dotConc,
    text: styles.optionConc,
  },
  {
    value: "CANC",
    label: "CANCELADO",
    badge: styles.statusCanc,
    dot: styles.dotCanc,
    text: styles.optionCanc,
  },
];

export function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = STATUS_OPTIONS.find((o) => o.value === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.statusWrapper} ref={ref}>
      <button
        className={`${styles.statusBtn} ${current?.badge ?? ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {current?.label}
        <ChevronDown size={12} className={open ? styles.iconOpen : ""} />
      </button>

      {open && (
        <div className={styles.statusDropdown}>
          {STATUS_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`${styles.statusOption} ${opt.text}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className={`${styles.dot} ${opt.dot}`} />
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
