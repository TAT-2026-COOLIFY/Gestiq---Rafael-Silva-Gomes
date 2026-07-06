import styles from "./ScrumSection.module.css";
import { TaskItem } from "../TaskItem/TaskItem";

export function ScrumSection({
  title,
  icon: Icon,
  iconColor,
  tasks,
  selectedTaskIds,
  onToggleTask,
  headerActions,
  emptyStateText,
}) {
  return (
    <div className={styles.boardSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          {Icon && <Icon size={18} color={iconColor} />}
          <h4 className={styles.sprintName}>{title}</h4>
          <span className={styles.taskCount}>{tasks.length} Tarefas</span>
        </div>

        <div className={styles.headerActions}>{headerActions}</div>
      </div>

      <div className={styles.taskList}>
        {tasks.length === 0 ? (
          <div className={styles.emptyState}>{emptyStateText}</div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskIds.includes(task.id)}
              onToggle={() => onToggleTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
