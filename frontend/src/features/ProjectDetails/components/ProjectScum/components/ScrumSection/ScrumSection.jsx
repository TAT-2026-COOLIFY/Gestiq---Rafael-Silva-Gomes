import { useMemo } from "react";
import { Settings } from "lucide-react";
import styles from "./ScrumSection.module.css";
import { TaskItem } from "../TaskItem/TaskItem";

const formatDate = (dateString) => {
  if (!dateString) return "--/--";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}`;
};

export function ScrumSection({
  title,
  icon: Icon,
  iconColor,
  tasks,
  selectedTaskIds,
  onToggleTask,
  headerActions,
  emptyStateText,
  onOpenDrawer,
  hideCheckboxes,
  finishedSprintIds,
  onOpenSettings,
}) {
  // Calcula os Story Points por status exclusivamente para as tarefas desta seção
  const spSums = useMemo(() => {
    const sums = { PLAN: 0, DOING: 0, REVIEW: 0, DONE: 0 };
    tasks.forEach((task) => {
      const sp = parseFloat(task.story_points) || 0;
      if (sums[task.status] !== undefined) {
        sums[task.status] += sp;
      }
    });
    return sums;
  }, [tasks]);

  return (
    <div className={styles.boardSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          {Icon && <Icon size={18} color={iconColor} />}
          <h4 className={styles.sprintName}>{title}</h4>
          <span className={styles.taskCount}>{tasks.length} Tarefas</span>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={styles.settingsBtn}
              title="Detalhes e Configurações da Sprint"
            >
              <Settings size={16} />
            </button>
          )}

          {/* 👇 Bolinhas minimalistas coloridas (só aparecem se o valor for maior que 0) */}
          <div className={styles.indicators}>
            {spSums.PLAN > 0 && (
              <span
                className={`${styles.indicatorCircle} ${styles.PLAN}`}
                title="Story Points: A Iniciar"
              >
                {spSums.PLAN}
              </span>
            )}
            {spSums.DOING > 0 && (
              <span
                className={`${styles.indicatorCircle} ${styles.DOING}`}
                title="Story Points: Em Andamento"
              >
                {spSums.DOING}
              </span>
            )}
            {spSums.REVIEW > 0 && (
              <span
                className={`${styles.indicatorCircle} ${styles.REVIEW}`}
                title="Story Points: Em Validação"
              >
                {spSums.REVIEW}
              </span>
            )}
            {spSums.DONE > 0 && (
              <span
                className={`${styles.indicatorCircle} ${styles.DONE}`}
                title="Story Points: Concluído"
              >
                {spSums.DONE}
              </span>
            )}
          </div>
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
              onOpenDrawer={onOpenDrawer}
              hideCheckbox={hideCheckboxes}
              isPastSprint={finishedSprintIds?.has(task.sprint)}
            />
          ))
        )}
      </div>
    </div>
  );
}
