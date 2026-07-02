import {
  CheckSquare,
  Bug,
  BookOpen,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import styles from "./ProjectScrum.module.css";

const TYPE_CONFIG = {
  TASK: { icon: CheckSquare, color: "var(--color-task)" },
  BUG: { icon: Bug, color: "var(--color-bug)" },
  STORY: { icon: BookOpen, color: "var(--color-story)" },
};

const PRIORITY_CONFIG = {
  LOW: { icon: ArrowDown, color: "var(--color-prio-low)" },
  MEDIUM: { icon: ArrowRight, color: "var(--color-prio-med)" },
  HIGH: { icon: ArrowUp, color: "var(--color-prio-high)" },
  CRITICAL: { icon: AlertCircle, color: "var(--color-prio-crit)" },
};

const STATUS_MAP = {
  PLAN: "A Iniciar",
  DOING: "Em Andamento",
  REVIEW: "Em Validação",
  DONE: "Concluído",
};

export function TaskItem({ task, isSelected, onToggle }) {
  const TypeIcon = TYPE_CONFIG[task.type]?.icon || CheckSquare;
  const typeColor = TYPE_CONFIG[task.type]?.color || "#4bade8";

  const PrioIcon = PRIORITY_CONFIG[task.priority]?.icon || ArrowRight;
  const prioColor = PRIORITY_CONFIG[task.priority]?.color || "#ff991f";

  return (
    <div className={`${styles.taskItem} ${isSelected ? styles.selected : ""}`}>
      <div className={styles.taskMain}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className={styles.checkbox}
        />
        <TypeIcon size={16} color={typeColor} title={task.type} />
        <span className={styles.taskKey}>TASK-{task.id}</span>
        <span className={styles.taskTitle} onClick={onToggle}>
          {task.title}
        </span>
      </div>

      <div className={styles.taskMeta}>
        <span className={`${styles.statusBadge} ${styles[task.status]}`}>
          {STATUS_MAP[task.status] || task.status}
        </span>

        <PrioIcon
          size={16}
          color={prioColor}
          title={`Prioridade: ${task.priority}`}
        />

        <div className={styles.avatar}>
          {task.assigned_to_photo ? (
            <img
              src={task.assigned_to_photo}
              alt="Foto do responsável"
              className={styles.avatarImg}
              title={task.assigned_to_username}
            />
          ) : task.assigned_to_username ? (
            <span
              className={styles.avatarInitial}
              title={task.assigned_to_username}
            >
              {task.assigned_to_username.charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className={styles.avatarUnassigned} title="Não atribuído" />
          )}
        </div>

        <button className={styles.menuBtn}>
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
