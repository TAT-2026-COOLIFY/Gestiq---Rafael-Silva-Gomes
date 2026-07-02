import { useEffect, useState } from "react";
import api from "@/services/api";
import styles from "./ProjectScrum.module.css";
import { Loading } from "@/components/Loading/Loading";
import {
  CheckCircle2,
  ListTodo,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { ScrumSection } from "./ScrumSection";

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
        setTasks(tasksRes.data?.results || tasksRes.data);

        const sprintsData = sprintsRes.data?.results || sprintsRes.data;
        const activeSprint = sprintsData.find((s) => s.status !== "FINISHED");
        setCurrentSprint(activeSprint || null);
      } catch (err) {
        console.error(err);
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
    } catch {
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
        <ScrumSection
          title={currentSprint ? currentSprint.name : "Nenhuma Sprint Ativa"}
          icon={CheckCircle2}
          iconColor="var(--icon-blue)"
          tasks={sprintTasks}
          selectedTaskIds={selectedTaskIds}
          onToggleTask={toggleSelection}
          emptyStateText={
            currentSprint
              ? "Arraste ou envie tarefas do Backlog para iniciar a Sprint."
              : "Crie uma Sprint para começar."
          }
          headerActions={
            !currentSprint ? (
              <button className={styles.secondaryBtn}>+ Nova Sprint</button>
            ) : (
              <button className={styles.secondaryBtn}>Concluir Sprint</button>
            )
          }
        />

        <ScrumSection
          title="Backlog"
          icon={ListTodo}
          iconColor="var(--text-muted)"
          tasks={backlogTasks}
          selectedTaskIds={selectedTaskIds}
          onToggleTask={toggleSelection}
          emptyStateText="Seu backlog está vazio. Crie novas tarefas!"
          headerActions={
            <button className={styles.addBtn}>+ Criar Tarefa</button>
          }
        />
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
                    <ArrowDownCircle size={18} /> Remover da Sprint
                  </button>
                )}
                {isMovingToSprint && (
                  <button
                    onClick={() => handleBulkMove(currentSprint?.id)}
                    className={`${styles.actionBtn} ${styles.btnPrimary}`}
                  >
                    <ArrowUpCircle size={18} /> Subir para Sprint
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
