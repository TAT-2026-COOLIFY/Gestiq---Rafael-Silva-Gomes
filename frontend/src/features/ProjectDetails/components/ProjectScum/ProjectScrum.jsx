import { useState, useEffect, useCallback, useMemo } from "react";
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
import { notifyBurnupChanged } from "@/utils/burnupEvents";

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
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState("");
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [savingSprint, setSavingSprint] = useState(false);
  const [members, setMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [taskForm, setTaskForm] = useState(INITIAL_TASK);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [isEditingSprint, setIsEditingSprint] = useState(false);
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

  const showPopup = useCallback((message, id = null, type = "DELETE_TASK") => {
    setPopup({ message, id, type });
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
      setSprints(sprintsData);

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

  const finishedSprintIds = useMemo(() => {
    return new Set(
      sprints.filter((s) => s.status === "FINISHED").map((s) => s.id),
    );
  }, [sprints]);

  useEffect(() => {
    if (projectId) loadScrumData();
  }, [projectId, loadScrumData]);

  const handleEditTask = async (formData) => {
    if (!formData.title || formData.title.trim() === "") {
      showToast("O título da tarefa é obrigatório.", "error");
      return;
    }

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
      notifyBurnupChanged(projectId);

      showToast("Tarefa atualizada!", "success");
      setSelectedTask(null);
    } catch {
      showToast("Erro ao atualizar tarefa.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSaveTask = async (formData) => {
    if (!formData.title || formData.title.trim() === "") {
      showToast("O título da tarefa é obrigatório.", "error");
      return;
    }

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
      notifyBurnupChanged(projectId);

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
      notifyBurnupChanged(projectId);

      showToast("Tarefa excluída.", "success");
      setPopup(null);
      setSelectedTask(null);
    } catch {
      showToast("Erro ao excluir tarefa.");
    }
  };

  const handleOpenSprintSettings = () => {
    if (!currentSprint) return;
    setSprintForm({
      name: currentSprint.name || "",
      goal: currentSprint.goal || "",
      start_date: currentSprint.start_date || "",
      end_date: currentSprint.end_date || "",
    });
    setIsEditingSprint(true);
    setSprintModalOpen(true);
  };

  const handleSaveSprint = async (form) => {
    if (!canCreateSprint) return; // Trava de segurança
    setSavingSprint(true);

    try {
      const payload = {
        project: projectId,
        name: form.name,
        goal: form.goal,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      if (isEditingSprint) {
        // Atualiza a sprint existente
        await api.patch(`sprints/${currentSprint.id}/`, payload);
        showToast("Sprint atualizada com sucesso!", "success");
      } else {
        // Cria uma nova (adicionando o status PLANNED)
        payload.status = "PLANNED";
        await api.post("sprints/", payload);
        showToast("Sprint criada com sucesso!", "success");
      }

      setSprintModalOpen(false);
      setSprintForm(INITIAL_SPRINT);
      await loadScrumData();
    } catch (error) {
      console.error("Erro completo:", error.response?.data);
      const errorMsg = error.response?.data
        ? Object.values(error.response.data).flat().join(" | ")
        : "Erro ao salvar Sprint.";
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
      showToast(
        "Você não tem nenhuma Sprint ativa ou planejada. Crie uma primeiro!",
      );
      return;
    }
    setActionStatus("Movendo...");
    try {
      const responses = await Promise.all(
        selectedTaskIds.map((id) =>
          api.patch(`activities/${id}/`, { sprint: targetSprintId }),
        ),
      );
      const updatedTasks = new Map(
        responses.map((response) => [response.data.id, response.data]),
      );
      setTasks((prev) =>
        prev.map((task) =>
          updatedTasks.get(task.id) || task,
        ),
      );
      notifyBurnupChanged(projectId);
      setSelectedTaskIds([]);
      setActionStatus("Sucesso");
      setTimeout(() => setActionStatus(""), 3000);
    } catch {
      setActionStatus("Erro");
      setTimeout(() => setActionStatus(""), 3000);
    }
  };

  const assignees = useMemo(() => {
    const uniqueUsers = new Map();
    let hasUnassigned = false;
    tasks.forEach((task) => {
      if (!task.assigned_to) hasUnassigned = true;
      else if (!uniqueUsers.has(task.assigned_to)) {
        uniqueUsers.set(task.assigned_to, {
          id: task.assigned_to,
          name: task.assigned_to_first_name || task.assigned_to_username,
          photo: task.assigned_to_photo,
        });
      }
    });
    return { users: Array.from(uniqueUsers.values()), hasUnassigned };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee === "UNASSIGNED") return !t.assigned_to;
      if (filterAssignee !== null) return t.assigned_to === filterAssignee;
      return true;
    });
  }, [tasks, filterAssignee]);

  const sprintTasks = useMemo(
    () => filteredTasks.filter((t) => t.sprint === currentSprint?.id),
    [filteredTasks, currentSprint],
  );

  const backlogTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (t.status === "DONE") return false;

      const isNoSprint = t.sprint === null;
      const isFromPastSprint = finishedSprintIds.has(t.sprint);

      return isNoSprint || isFromPastSprint;
    });
  }, [filteredTasks, finishedSprintIds]);

  const isAllSprintSelected = useMemo(() => {
    return (
      sprintTasks.length > 0 &&
      sprintTasks.map((t) => t.id).every((id) => selectedTaskIds.includes(id))
    );
  }, [sprintTasks, selectedTaskIds]);

  const isAllBacklogSelected = useMemo(() => {
    return (
      backlogTasks.length > 0 &&
      backlogTasks.map((t) => t.id).every((id) => selectedTaskIds.includes(id))
    );
  }, [backlogTasks, selectedTaskIds]);

  if (loading) return <Loading />;

  const handleSelectAllSprint = () => {
    const sprintIds = sprintTasks.map((t) => t.id);
    if (isAllSprintSelected) {
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !sprintIds.includes(id)),
      );
    } else {
      setSelectedTaskIds((prev) =>
        Array.from(new Set([...prev, ...sprintIds])),
      );
    }
  };

  const handleSelectAllBacklog = () => {
    const backlogIds = backlogTasks.map((t) => t.id);
    if (isAllBacklogSelected) {
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !backlogIds.includes(id)),
      );
    } else {
      setSelectedTaskIds((prev) =>
        Array.from(new Set([...prev, ...backlogIds])),
      );
    }
  };

  const isMovingToSprint = tasks.some(
    (t) => selectedTaskIds.includes(t.id) && t.sprint !== currentSprint?.id,
  );

  const isMovingToBacklog = tasks.some(
    (t) => selectedTaskIds.includes(t.id) && t.sprint === currentSprint?.id,
  );

  const statusClass =
    actionStatus === "Movendo..."
      ? "salvando"
      : actionStatus === "Sucesso"
        ? "salvo"
        : actionStatus === "Erro"
          ? "erro"
          : "";

  const isSelectedTaskInActiveSprint =
    selectedTask?.sprint === currentSprint?.id &&
    currentSprint?.status === "ACTIVE";

  return (
    <div className={styles.container}>
      {(assignees.users.length > 0 || assignees.hasUnassigned) && (
        <div className={styles.globalFilterBar}>
          <span className={styles.filterLabel}>Filtrar por:</span>

          <div className={styles.avatarList}>
            {assignees.users.map((user) => (
              <button
                key={user.id}
                onClick={() =>
                  setFilterAssignee((prev) =>
                    prev === user.id ? null : user.id,
                  )
                }
                title={user.name}
                className={`${styles.filterAvatar} 
                  ${filterAssignee === user.id ? styles.activeAvatar : ""} 
                  ${filterAssignee !== null && filterAssignee !== user.id ? styles.inactiveAvatar : ""}`}
              >
                {user.photo ? (
                  <img src={user.photo} alt={user.name} />
                ) : (
                  <span>{user.name[0].toUpperCase()}</span>
                )}
              </button>
            ))}

            {assignees.hasUnassigned && (
              <button
                onClick={() =>
                  setFilterAssignee((prev) =>
                    prev === "UNASSIGNED" ? null : "UNASSIGNED",
                  )
                }
                title="Não Atribuído"
                className={`${styles.filterAvatar} ${styles.unassignedAvatar} 
                  ${filterAssignee === "UNASSIGNED" ? styles.activeAvatar : ""} 
                  ${filterAssignee !== null && filterAssignee !== "UNASSIGNED" ? styles.inactiveAvatar : ""}`}
              >
                ?
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.boardVertical}>
        <ScrumSection
          title={currentSprint ? currentSprint.name : "Nenhuma Sprint Ativa"}
          onOpenSettings={currentSprint ? handleOpenSprintSettings : null}
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
          hideCheckboxes={currentSprint?.status === "ACTIVE"}
          headerActions={
            <div className={styles.headerActionGroup}>
              {sprintTasks.length > 0 && currentSprint?.status !== "ACTIVE" && (
                <button
                  onClick={handleSelectAllSprint}
                  className={styles.selectAllBtn}
                >
                  {isAllSprintSelected ? "Desmarcar Todas" : "Selecionar Todas"}
                </button>
              )}

              {canCreateSprint &&
                (!currentSprint ? (
                  <button
                    onClick={() => setSprintModalOpen(true)}
                    className={styles.secondaryBtn}
                  >
                    + Nova Sprint
                  </button>
                ) : currentSprint.status === "PLANNED" ? (
                  <button
                    onClick={() =>
                      showPopup(
                        "Deseja realmente iniciar esta Sprint?",
                        null,
                        "START_SPRINT",
                      )
                    }
                    className={styles.addBtn}
                  >
                    Iniciar Sprint
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      showPopup(
                        "Tem certeza que deseja concluir e encerrar esta Sprint?",
                        null,
                        "FINISH_SPRINT",
                      )
                    }
                    className={styles.secondaryBtn}
                  >
                    Concluir Sprint
                  </button>
                ))}
            </div>
          }
          onOpenDrawer={(task) => setSelectedTask(task)}
        />

        <ScrumSection
          title="Backlog"
          tasks={backlogTasks}
          selectedTaskIds={selectedTaskIds}
          onToggleTask={toggleSelection}
          onOpenDrawer={(task) => setSelectedTask(task)}
          finishedSprintIds={finishedSprintIds}
          headerActions={
            <div className={styles.headerActionGroup}>
              {backlogTasks.length > 0 && (
                <button
                  onClick={handleSelectAllBacklog}
                  className={styles.selectAllBtn}
                >
                  {isAllBacklogSelected
                    ? "Desmarcar Todas"
                    : "Selecionar Todas"}
                </button>
              )}
              <button
                className={styles.addBtn}
                onClick={() => setTaskModalOpen(true)}
              >
                + Nova Tarefa
              </button>
            </div>
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
                    onClick={() => {
                      if (currentSprint?.status === "ACTIVE") {
                        showToast(
                          "Não é possível remover tarefas de uma Sprint em andamento.",
                        );
                        return;
                      }
                      handleBulkMove(null);
                    }}
                    className={`${styles.actionBtn}`}
                    title={"Remover da Sprint"}
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
            canEdit={canCreateSprint}
            isEditing={isEditingSprint}
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
            canDelete={!isSelectedTaskInActiveSprint}
          />
        )}
        {popup && (
          <Popup
            key="scrum-popup"
            message={popup.message}
            onClose={() => setPopup(null)}
            action={() => {
              if (popup.type === "START_SPRINT") {
                handleStartSprint();
                setPopup(null);
              } else if (popup.type === "FINISH_SPRINT") {
                handleFinishSprint();
                setPopup(null);
              } else {
                handleDeleteTask(popup.id);
              }
            }}
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
