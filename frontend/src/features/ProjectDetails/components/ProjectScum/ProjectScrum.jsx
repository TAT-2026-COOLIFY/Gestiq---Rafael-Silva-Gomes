import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
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
import { Toast } from "@/components/Toast";
import { ScrumSection } from "./components/ScrumSection/ScrumSection";
import { SprintModal } from "./components/SprintModal/SprintModal";
import {
  COLUMNS,
  TYPES,
  PRIORITIES,
  INITIAL_TASK,
} from "@/utils/taskConstants";
import { KanbanModal } from "../ProjectKanban/components/KanbanModal/KanbanModal";
import { KanbanDrawer } from "../ProjectKanban/components/KanbanDrawer/KanbanDrawer";
import { Popup } from "@/components/Popup";

const INITIAL_SPRINT = {
  name: "",
  goal: "",
  start_date: "",
  end_date: "",
};

export function ProjectScrum({ projectId, permissions }) {
  const [tasks, setTasks] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState("");
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [savingSprint, setSavingSprint] = useState(false);
  const [members, setMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [taskForm, setTaskForm] = useState(INITIAL_TASK);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [sprintForm, setSprintForm] = useState(INITIAL_SPRINT);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [popup, setPopup] = useState(null);
  const [toast, setToast] = useState(null);

  const canCreateSprint = permissions?.canCreateSprint || false;

  const showToast = useCallback((message, type = "error") => {
    setToast({ id: Math.random(), message, type });
  }, []);

  const showPopup = useCallback((message, id) => {
    setPopup({ message, id });
  }, []);

  const loadScrumData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, sprintsRes, membersRes, milestonesRes] =
        await Promise.all([
          api.get(`activities/?project=${projectId}`),
          api.get(`sprints/?project=${projectId}`),
          api.get(`members/?project=${projectId}`),
          api.get(`milestones/?project=${projectId}`),
        ]);

      setTasks(tasksRes.data?.results || tasksRes.data);

      const sprintsData = sprintsRes.data?.results || sprintsRes.data;
      const activeSprint = sprintsData.find((s) => s.status !== "FINISHED");
      setCurrentSprint(activeSprint || null);
      setMembers(membersRes.data?.results || membersRes.data);
      setMilestones(milestonesRes.data?.results || milestonesRes.data);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    if (projectId) loadScrumData();
  }, [projectId, loadScrumData]);

  const handleEditTask = async (formData) => {
    setEditSaving(true);
    try {
      const payload = { ...formData, project: projectId };
      if (!payload.milestone || payload.milestone === "")
        payload.milestone = null;
      if (!payload.assigned_to || payload.assigned_to === "")
        payload.assigned_to = null;

      const res = await api.put(`activities/${formData.id}/`, payload);

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === res.data.id ? res.data : t)),
      );

      showToast("Tarefa atualizada!", "success");
      setSelectedTask(null);
    } catch {
      showToast("Erro ao atualizar tarefa.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveTask = async (formData) => {
    setSavingTask(true);
    try {
      const payload = {
        ...formData,
        project: projectId,
        sprint: null,
      };
      if (!payload.milestone || payload.milestone === "")
        payload.milestone = null;
      if (!payload.assigned_to || payload.assigned_to === "")
        payload.assigned_to = null;

      const res = await api.post("activities/", payload);

      setTasks((prevTasks) => [...prevTasks, res.data]);

      showToast("Tarefa adicionada ao Backlog!", "success");
      setTaskModalOpen(false);
      setTaskForm(INITIAL_TASK);
    } catch {
      showToast("Erro ao criar tarefa.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`activities/${id}/`);

      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));

      showToast("Tarefa excluída.", "success");
      setPopup(null);
      setSelectedTask(null);
    } catch {
      showToast("Erro ao excluir tarefa.");
    }
  };

  const handleSaveSprint = async (form) => {
    if (!canCreateSprint) return;

    setSavingSprint(true);
    try {
      const payload = {
        project: projectId,
        name: form.name,
        goal: form.goal,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: "PLANNED",
      };

      await api.post("sprints/", payload);

      showToast("Sprint criada com sucesso!", "success");
      setSprintModalOpen(false);
      setSprintForm(INITIAL_SPRINT);

      await loadScrumData();
    } catch (error) {
      console.error("Erro completo:", error.response?.data);

      const errorMsg = error.response?.data
        ? Object.values(error.response.data).flat().join(" | ")
        : "Erro ao criar Sprint.";

      showToast(errorMsg);
    } finally {
      setSavingSprint(false);
    }
  };

  const handleStartSprint = async () => {
    if (!canCreateSprint) return;
    if (!currentSprint) return;
    try {
      await api.patch(`sprints/${currentSprint.id}/`, { status: "ACTIVE" });
      showToast("Sprint iniciada com sucesso!", "success");
      await loadScrumData();
    } catch (error) {
      showToast("Erro ao iniciar a Sprint.");
      console.error(error);
    }
  };

  const handleFinishSprint = async () => {
    if (!canCreateSprint) return;
    if (!currentSprint) return;

    if (!window.confirm("Tem certeza que deseja concluir esta Sprint?")) return;

    try {
      await api.patch(`sprints/${currentSprint.id}/`, { status: "FINISHED" });
      showToast("Sprint concluída!", "success");
      await loadScrumData();
    } catch (error) {
      showToast("Erro ao concluir a Sprint.");
      console.error(error);
    }
  };

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
          iconColor="var(--primary)"
          tasks={sprintTasks}
          selectedTaskIds={selectedTaskIds}
          onToggleTask={toggleSelection}
          emptyStateText={
            currentSprint
              ? "Arraste tarefas do Backlog para iniciar a Sprint."
              : "Crie uma Sprint para começar."
          }
          headerActions={
            canCreateSprint &&
            (!currentSprint ? (
              <button
                onClick={() => setSprintModalOpen(true)}
                className={styles.secondaryBtn}
              >
                + Nova Sprint
              </button>
            ) : currentSprint.status === "PLANNED" ? (
              <button onClick={handleStartSprint} className={styles.addBtn}>
                Iniciar Sprint
              </button>
            ) : (
              <button
                onClick={handleFinishSprint}
                className={styles.secondaryBtn}
              >
                Concluir Sprint
              </button>
            ))
          }
          onOpenDrawer={(task) => setSelectedTask(task)}
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
            <button
              className={styles.addBtn}
              onClick={() => setTaskModalOpen(true)}
            >
              + Nova Tarefa
            </button>
          }
          onOpenDrawer={(task) => setSelectedTask(task)}
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
      <AnimatePresence>
        {taskModalOpen && (
          <KanbanModal
            form={taskForm}
            onFormChange={setTaskForm}
            onClose={() => setTaskModalOpen(false)}
            onSave={handleSaveTask}
            saving={savingTask}
            milestones={milestones}
            columns={COLUMNS}
            types={TYPES}
            priorities={PRIORITIES}
            members={members}
          />
        )}
        {sprintModalOpen && (
          <SprintModal
            form={sprintForm}
            onFormChange={setSprintForm}
            onClose={() => setSprintModalOpen(false)}
            onSave={handleSaveSprint}
            saving={savingSprint}
          />
        )}
        {selectedTask && (
          <KanbanDrawer
            key={selectedTask.id}
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleEditTask}
            onDelete={(id) =>
              showPopup("Tem certeza que deseja excluir esta tarefa?", id)
            }
            saving={editSaving}
            milestones={milestones}
            columns={COLUMNS}
            types={TYPES}
            priorities={PRIORITIES}
            members={members}
            canEdit={true}
          />
        )}
        {popup && (
          <Popup
            key="task-popup"
            message={popup.message}
            onClose={() => setPopup(null)}
            action={() => handleDeleteTask(popup.id)}
          />
        )}
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
