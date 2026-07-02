import { useEffect, useState } from "react";
import api from "@/services/api";
import styles from "./ProjectScrum.module.css";
import { Loading } from "@/components/Loading/Loading";
import {
  ListTodo,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  AlertCircle,
  MoreVertical,
  Bug,
  CheckSquare,
  BookOpen,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

const TYPE_CONFIG = {
  TASK: { icon: CheckSquare, color: "#4bade8" },
  BUG: { icon: Bug, color: "#e5493a" },
  STORY: { icon: BookOpen, color: "#65ba43" },
};

const PRIORITY_CONFIG = {
  LOW: { icon: ArrowDown, color: "#0065ff" },
  MEDIUM: { icon: ArrowRight, color: "#ff991f" },
  HIGH: { icon: ArrowUp, color: "#ff5630" },
  CRITICAL: { icon: AlertCircle, color: "#bf2600" },
};

const STATUS_MAP = {
  PLAN: "A Iniciar",
  DOING: "Em Andamento",
  REVIEW: "Em Validação",
  DONE: "Concluído",
};

export function ProjectScrum({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState("");

  useEffect(() => {
    if (!projectId) return;

    async function loadScrumData() {
      try {
        const [tasksRes, sprintsRes] = await Promise.all([
          api.get(`activities/?project=${projectId}`),
          api.get(`sprints/?project=${projectId}`),
        ]);

        const activitiesData = tasksRes.data?.results || tasksRes.data;
        const sprintsData = sprintsRes.data?.results || sprintsRes.data;

        setTasks(activitiesData);

        const activeSprint = sprintsData.find((s) => s.status !== "FINISHED");
        setCurrentSprint(activeSprint || null);
      } catch (err) {
        console.error("Erro ao carregar dados do Scrum:", err);
      } finally {
        setLoading(false);
      }
    }

    loadScrumData();
  }, [projectId]);

  const toggleSelection = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleBulkMove = async (targetSprintId) => {
    if (targetSprintId !== null && !currentSprint) {
      alert(
        "Você não tem nenhuma Sprint ativa ou planejada. Crie uma primeiro!",
      );
      return;
    }

    setActionStatus("Movendo...");

    try {
      await Promise.all(
        selectedTaskIds.map((id) =>
          api.patch(`activities/${id}/`, { sprint: targetSprintId }),
        ),
      );

      setTasks((prev) =>
        prev.map((task) =>
          selectedTaskIds.includes(task.id)
            ? { ...task, sprint: targetSprintId }
            : task,
        ),
      );

      setSelectedTaskIds([]);
      setActionStatus("Sucesso");
      setTimeout(() => setActionStatus(""), 3000);
    } catch (err) {
      console.error("Erro ao mover tarefas:", err);
      setActionStatus("Erro");
      setTimeout(() => setActionStatus(""), 3000);
    }
  };

  if (loading) return <Loading />;

  const backlogTasks = tasks.filter((task) => task.sprint === null);
  const sprintTasks = tasks.filter((task) => task.sprint !== null);

  const isMovingToSprint = tasks.some(
    (t) => selectedTaskIds.includes(t.id) && t.sprint === null,
  );
  const isMovingToBacklog = tasks.some(
    (t) => selectedTaskIds.includes(t.id) && t.sprint !== null,
  );

  const statusClass =
    actionStatus === "Movendo..."
      ? "salvando"
      : actionStatus === "Sucesso"
        ? "salvo"
        : actionStatus === "Erro"
          ? "erro"
          : "";

  return (
    <div className={styles.container}>
      <div className={styles.boardVertical}>
        <div className={styles.boardSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <CheckCircle2 size={18} color="#0052cc" />
              <h4 className={styles.sprintName}>
                {currentSprint
                  ? currentSprint.name || currentSprint.title
                  : "Nenhuma Sprint Ativa"}
              </h4>
              <span className={styles.taskCount}>
                {sprintTasks.length} Tarefas
              </span>
            </div>

            <div className={styles.headerActions}>
              {!currentSprint ? (
                <button className={styles.secondaryBtn}>+ Nova Sprint</button>
              ) : (
                <button className={styles.secondaryBtn}>Concluir Sprint</button>
              )}
            </div>
          </div>

          <div className={styles.taskList}>
            {sprintTasks.length === 0 ? (
              <div className={styles.emptyState}>
                {currentSprint
                  ? "Arraste ou envie tarefas do Backlog para iniciar a Sprint."
                  : "Crie uma Sprint para começar."}
              </div>
            ) : (
              sprintTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggle={() => toggleSelection(task.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className={styles.boardSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTitle}>
              <ListTodo size={18} color="#42526e" />
              <h4 className={styles.sprintName}>Backlog</h4>
              <span className={styles.taskCount}>
                {backlogTasks.length} Tarefas
              </span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.addBtn}>+ Criar Tarefa</button>
            </div>
          </div>

          <div className={styles.taskList}>
            {backlogTasks.length === 0 ? (
              <div className={styles.emptyState}>
                Seu backlog está vazio. Crie novas tarefas!
              </div>
            ) : (
              backlogTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggle={() => toggleSelection(task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {(selectedTaskIds.length > 0 || actionStatus) && (
        <div className={styles.floatingBarWrapper}>
          <div className={`${styles.floatingBar} ${styles[statusClass]}`}>
            <div className={styles.floatingStatus}>
              {actionStatus === "Movendo..." && (
                <Loader2 size={18} className={styles.spin} />
              )}
              {actionStatus === "Sucesso" && <CheckCircle2 size={18} />}
              {actionStatus === "Erro" && <AlertCircle size={18} />}
              {actionStatus && <span>{actionStatus}</span>}
            </div>

            {selectedTaskIds.length > 0 && !actionStatus && (
              <div className={styles.floatingActions}>
                <span className={styles.selectionCount}>
                  {selectedTaskIds.length} selecionada(s)
                </span>

                {isMovingToBacklog && (
                  <button
                    onClick={() => handleBulkMove(null)}
                    className={styles.actionBtn}
                  >
                    <ArrowDownCircle size={18} />
                    Remover da Sprint
                  </button>
                )}

                {isMovingToSprint && (
                  <button
                    onClick={() => handleBulkMove(currentSprint?.id)}
                    className={`${styles.actionBtn} ${styles.btnPrimary}`}
                  >
                    <ArrowUpCircle size={18} />
                    Subir para Sprint
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, isSelected, onToggle }) {
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
