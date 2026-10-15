import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/services/api";
import { Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { Loading } from "@/components/Loading/Loading";
import { AnimatePresence } from "framer-motion";
import { KanbanModal } from "./components/KanbanModal/KanbanModal";
import { KanbanDrawer } from "./components/KanbanDrawer/KanbanDrawer";
import {
  COLUMNS,
  TYPES,
  PRIORITIES,
  INITIAL_TASK,
} from "@/utils/taskConstants";
import styles from "./ProjectKanban.module.css";
import { notifyBurnupChanged } from "@/utils/burnupEvents";

export function ProjectKanban({ projectId, permissions }) {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_TASK);

  const [selectedTask, setSelectedTask] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);

  const [filterAssignee, setFilterAssignee] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);

  const showToast = useCallback((message, type = "error") => {
    setToast({ id: Math.random(), message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const showPopup = useCallback((message, id) => {
    setPopup({ message, id });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, milestonesRes, membersRes, sprintsRes] =
        await Promise.all([
          api.get(`activities/?project=${projectId}`),
          api.get(`milestones/?project=${projectId}`),
          api.get(`members/?project=${projectId}`),
          api.get(`sprints/?project=${projectId}`),
        ]);

      setTasks(tasksRes.data.results ?? tasksRes.data);
      setMilestones(milestonesRes.data.results ?? milestonesRes.data);
      setMembers(membersRes.data.results ?? membersRes.data);

      const sprintsData = sprintsRes.data.results ?? sprintsRes.data;
      const activeSprint = sprintsData.find((s) => s.status === "ACTIVE");
      setCurrentSprint(activeSprint || null);
    } catch {
      showToast("Erro ao carregar dados do Kanban.");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  const canEdit = permissions?.canManageKanban || false;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragStart = (e, taskId) => {
    if (!canEdit) return;
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnId) => {
    if (!canEdit) return;
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    if (!canEdit) return;
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    if (!canEdit) return;
    e.preventDefault();
    setDraggedOverColumn(null);

    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id.toString() === taskId);

    if (!task || task.status === newStatus) return;

    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        t.id.toString() === taskId ? { ...t, status: newStatus } : t,
      ),
    );

    try {
      const response = await api.patch(`activities/${taskId}/`, {
        status: newStatus,
      });
      setTasks((current) =>
        current.map((item) =>
          item.id === response.data.id ? response.data : item,
        ),
      );
      notifyBurnupChanged(projectId);
    } catch {
      setTasks(previousTasks);
      showToast("Erro ao mover a tarefa.");
    }
  };

  const assignees = useMemo(() => {
    const uniqueUsers = new Map();
    let hasUnassigned = false;

    tasks.forEach((task) => {
      if (!task.assigned_to) {
        hasUnassigned = true;
      } else if (!uniqueUsers.has(task.assigned_to)) {
        uniqueUsers.set(task.assigned_to, {
          id: task.assigned_to,
          name: task.assigned_to_first_name || task.assigned_to_username,
          photo: task.assigned_to_photo,
        });
      }
    });

    return {
      users: Array.from(uniqueUsers.values()),
      hasUnassigned,
    };
  }, [tasks]);

  async function handleSave(formData) {
    if (!canEdit) return;

    if (!formData.title || formData.title.trim() === "") {
      showToast("O título da tarefa é obrigatório.", "error");
      return;
    }
    if (!formData.milestone) {
      showToast("Vincule a tarefa a um marco da linha do tempo.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, project: projectId };
      if (!payload.milestone || payload.milestone === "") {
        payload.milestone = null;
      }

      if (!payload.assigned_to || payload.assigned_to === "")
        payload.assigned_to = null;
      if (payload.story_points === "") payload.story_points = null;

      const res = await api.post("activities/", payload);
      setTasks([...tasks, res.data]);
      notifyBurnupChanged(projectId);
      setForm(INITIAL_TASK);
      setModalOpen(false);
      showToast("Tarefa criada com sucesso!", "success");
    } catch {
      showToast("Erro ao criar tarefa.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(formData) {
    if (!canEdit) return;

    if (!formData.title || formData.title.trim() === "") {
      showToast("O título da tarefa é obrigatório.", "error");
      return;
    }
    if (!formData.milestone) {
      showToast("Vincule a tarefa a um marco da linha do tempo.", "error");
      return;
    }

    setEditSaving(true);
    try {
      const payload = { ...formData, project: projectId };
      if (!payload.milestone || payload.milestone === "") {
        payload.milestone = null;
      }

      if (!payload.assigned_to || payload.assigned_to === "") {
        payload.assigned_to = null;
      }
      if (payload.story_points === "") payload.story_points = null;

      const res = await api.put(`activities/${formData.id}/`, payload);
      setTasks(tasks.map((t) => (t.id === res.data.id ? res.data : t)));
      notifyBurnupChanged(projectId);
      setSelectedTask(null);
      showToast("Tarefa atualizada!", "success");
    } catch {
      showToast("Erro ao atualizar tarefa.");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!canEdit) return;
    try {
      await api.delete(`activities/${id}/`);
      setTasks(tasks.filter((t) => t.id !== id));
      notifyBurnupChanged(projectId);
      setPopup(null);
      setSelectedTask(null);
      showToast("Tarefa excluída.", "success");
    } catch {
      showToast("Erro ao excluir tarefa.");
    }
  }

  const isSelectedTaskInActiveSprint =
    selectedTask?.sprint === currentSprint?.id &&
    currentSprint?.status === "ACTIVE";

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.headerLeft}>
          <h3 className={styles.sectionTitle}>QUADRO KANBAN</h3>

          {(assignees.users.length > 0 || assignees.hasUnassigned) && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Filtrar:</span>

              {assignees.users.map((user) => (
                <button
                  key={user.id}
                  onClick={() =>
                    setFilterAssignee((prev) =>
                      prev === user.id ? null : user.id,
                    )
                  }
                  title={`${user.name}`}
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
          )}
        </div>

        {canEdit && (
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Nova Tarefa
          </button>
        )}
      </div>

      <div className={styles.boardWrapper}>
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => {
            if (t.status !== col.id) return false;
            if (filterAssignee === "UNASSIGNED") return !t.assigned_to;
            if (filterAssignee !== null)
              return t.assigned_to === filterAssignee;
            return true;
          });

          return (
            <div
              key={col.id}
              className={`${styles.column} ${styles[`column${col.id}`]}`}
            >
              <div className={styles.columnHeader}>
                {col.title}
                <span className={styles.taskCount}>{columnTasks.length}</span>
              </div>

              <div
                className={`${styles.columnBody} ${draggedOverColumn === col.id ? styles.columnBodyDragOver : ""}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {columnTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>Mova tarefas para cá</div>
                ) : (
                  columnTasks.map((task) => {
                    const linkedMilestone = milestones.find(
                      (m) => m.id === task.milestone,
                    );
                    return (
                      <div
                        key={task.id}
                        className={styles.taskCard}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTask(task)}
                      >
                        <h4 className={styles.taskTitle}>{task.title}</h4>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "8px",
                          }}
                        >
                          {linkedMilestone ? (
                            <span className={styles.taskMilestone}>
                              {linkedMilestone.task}
                            </span>
                          ) : (
                            <span />
                          )}

                          {(task.assigned_to_first_name ||
                            task.assigned_to_username) && (
                            <div
                              title={`${task.assigned_to_first_name || task.assigned_to_username}`}
                            >
                              {task.assigned_to_photo ? (
                                <img
                                  src={task.assigned_to_photo}
                                  alt="Responsável"
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    background: "#e2e8f0",
                                    color: "#475569",
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {(task.assigned_to_first_name ||
                                    task.assigned_to_username)[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <KanbanModal
            key="task-modal"
            form={form}
            onFormChange={setForm}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saving={saving}
            milestones={milestones}
            columns={COLUMNS}
            types={TYPES}
            priorities={PRIORITIES}
            members={members}
          />
        )}
        {selectedTask && (
          <KanbanDrawer
            key={selectedTask.id}
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleEdit}
            onDelete={(id) =>
              showPopup("Tem certeza que deseja excluir esta tarefa?", id)
            }
            saving={editSaving}
            milestones={milestones}
            columns={COLUMNS}
            types={TYPES}
            priorities={PRIORITIES}
            members={members}
            canEdit={canEdit}
            canDelete={!isSelectedTaskInActiveSprint}
          />
        )}
        {popup && (
          <Popup
            key="task-popup"
            message={popup.message}
            onClose={() => setPopup(null)}
            action={() => handleDelete(popup.id)}
          />
        )}
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
