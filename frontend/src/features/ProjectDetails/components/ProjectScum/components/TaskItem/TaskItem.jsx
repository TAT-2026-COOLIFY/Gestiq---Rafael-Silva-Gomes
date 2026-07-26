import {
  CheckSquare,
  Bug,
  BookOpen,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  AlertCircle,
  MoreVertical,
  History,
} from "lucide-react";
import styles from "./TaskItem.module.css";

const TYPE_CONFIG = {
  TASK: { icon: CheckSquare, color: "var(--primary)" },
  BUG: { icon: Bug, color: "#df3737" },
  STORY: { icon: BookOpen, color: "#3d9e1d" },
};

const PRIORITY_CONFIG = {
  LOW: { icon: ArrowDown, color: "#0065ff" },
  MEDIUM: { icon: ArrowRight, color: "#ff991f" },
  HIGH: { icon: ArrowUp, color: "#ff5630" },
  CRITICAL: { icon: AlertCircle, color: "#bf2600" },
};

const PRIORITY_LABELS = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const STATUS_MAP = {
  PLAN: "A Iniciar",
  DOING: "Em Andamento",
  REVIEW: "Em Validação",
  DONE: "Concluído",
};

export function TaskItem({
  task,
  isSelected,
  onToggle,
  onOpenDrawer,
  hideCheckbox,
  isPastSprint,
}) {
  const TypeIcon = TYPE_CONFIG[task.type]?.icon || CheckSquare;
  const typeColor = TYPE_CONFIG[task.type]?.color || "#4bade8";

  const priorityKey = task.priority ? task.priority.toUpperCase() : "MEDIUM";
  const PrioIcon = PRIORITY_CONFIG[priorityKey]?.icon || ArrowRight;
  const prioColor = PRIORITY_CONFIG[priorityKey]?.color || "#ff991f";

  return (
    <div className={`${styles.taskItem} ${isSelected ? styles.selected : ""}`}>
      <div className={styles.taskMain}>
        {!hideCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className={styles.checkbox}
          />
        )}
        <TypeIcon size={16} color={typeColor} title={task.type} />
        <span className={styles.taskKey}>TASK-{task.id}</span>
        <span className={styles.taskTitle} onClick={() => onOpenDrawer(task)}>
          {task.title}
        </span>
      </div>

      {isPastSprint && (
        <span
          className={styles.pastSprintBadge}
          title="Esta tarefa não foi concluída na Sprint passada"
        >
          <History size={12} />
          Sprint Passada
        </span>
      )}

      <div className={styles.taskMeta}>
        <span className={`${styles.statusBadge} ${styles[task.status]}`}>
          {STATUS_MAP[task.status] || task.status}
        </span>

        {task.story_points != null && (
          <span
            className={styles.storyPoint}
            title={`${task.story_points} Story Points`}
          >
            {task.story_points}
          </span>
        )}

        <span
          title={`Prioridade: ${PRIORITY_LABELS[priorityKey] || priorityKey}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <PrioIcon size={16} color={prioColor} />
        </span>

        <div className={styles.avatar}>
          {task.assigned_to_photo ? (
            <img
              src={task.assigned_to_photo}
              alt="Foto do responsável"
              className={styles.avatarImg}
              title={task.assigned_to_first_name || task.assigned_to_username}
            />
          ) : task.assigned_to_username ? (
            <span
              className={styles.avatarInitial}
              title={task.assigned_to_first_name || task.assigned_to_username}
            >
              {(task.assigned_to_first_name || task.assigned_to_username)
                .charAt(0)
                .toUpperCase()}
            </span>
          ) : (
            <span className={styles.avatarUnassigned} title="Não atribuído" />
          )}
        </div>
      </div>
    </div>
  );
}
