import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/services/api";
import { Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { Loading } from "@/components/Loading/Loading";
import { AnimatePresence } from "framer-motion";
import { KanbanModal } from "./KanbanModal";
import { KanbanDrawer } from "./KanbanDrawer";
import styles from "./ProjectKanban.module.css";

const COLUMNS = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "PLAN", title: "A Iniciar" },
  { id: "DOING", title: "Em Andamento" },
  { id: "REVIEW", title: "Em Validação" },
  { id: "DONE", title: "Concluída" },
];

const INITIAL_TASK = {
  title: "",
  description: "",
  status: "BACKLOG",
  milestone: "", // ID do marco vinculado
  assigned_to: "",
};

export function ProjectKanban({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]); // Para preencher os selects
  const [members, setMembers] = useState([]);

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

  // --- 1. Buscar Dados Iniciais ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Busca as tarefas e os marcos em paralelo para ser mais rápido
      const [tasksRes, milestonesRes, membersRes] = await Promise.all([
        api.get(`activities/?project=${projectId}`),
        api.get(`milestones/?project=${projectId}`),
        api.get(`members/?project=${projectId}`),
      ]);

      setTasks(tasksRes.data.results ?? tasksRes.data);
      setMilestones(milestonesRes.data.results ?? milestonesRes.data);
      setMembers(membersRes.data.results ?? membersRes.data);
    } catch {
      showToast("Erro ao carregar dados do Kanban.");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 2. Lógica do Drag and Drop (Nativo HTML5) ---
  const handleDragStart = (e, taskId) => {
    // Guarda o ID da tarefa que está sendo arrastada
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault(); // Necessário para permitir o "drop"
    setDraggedOverColumn(columnId); // Ativa o estilo CSS de hover na coluna
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);

    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id.toString() === taskId);

    if (!task || task.status === newStatus) return; // Se soltou na mesma coluna, ignora

    // 1. Atualização Otimista (Muda na tela antes do backend responder para UX perfeita)
    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        t.id.toString() === taskId ? { ...t, status: newStatus } : t,
      ),
    );

    // 2. Chama a API
    try {
      await api.patch(`activities/${taskId}/`, { status: newStatus });
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

  // --- 3. CRUD Padrão ---
  async function handleSave(formData) {
    setSaving(true);
    try {
      const payload = { ...formData, project: projectId };
      // Se não selecionou milestone, manda nulo pro backend
      if (!payload.milestone || payload.milestone === "") {
        payload.milestone = null;
      }

      if (!payload.assigned_to || payload.assigned_to === "")
        payload.assigned_to = null;

      const res = await api.post("activities/", payload);
      setTasks([...tasks, res.data]);
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
    setEditSaving(true);
    try {
      const payload = { ...formData, project: projectId };
      if (!payload.milestone || payload.milestone === "") {
        payload.milestone = null;
      }

      if (!payload.assigned_to || payload.assigned_to === "") {
        payload.assigned_to = null;
      }

      const res = await api.put(`activities/${formData.id}/`, payload);
      setTasks(tasks.map((t) => (t.id === res.data.id ? res.data : t)));
      setSelectedTask(null);
      showToast("Tarefa atualizada!", "success");
    } catch {
      showToast("Erro ao atualizar tarefa.");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`activities/${id}/`);
      setTasks(tasks.filter((t) => t.id !== id));
      setPopup(null);
      setSelectedTask(null);
      showToast("Tarefa excluída.", "success");
    } catch {
      showToast("Erro ao excluir tarefa.");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.headerLeft}>
          <h3 className={styles.sectionTitle}>Quadro Kanban</h3>

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
                    <img
                      src={`http://localhost:8000${user.photo}`}
                      alt={user.name}
                    />
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
                  title="Tarefas sem responsável"
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

        {/* O botão Nova Tarefa continua na direita */}
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      <div className={styles.boardWrapper}>
        {COLUMNS.map((col) => {
          // 👇 3. A MÁGICA ACONTECE AQUI: Aplicamos o filtro na hora de separar as colunas!
          const columnTasks = tasks.filter((t) => {
            if (t.status !== col.id) return false; // Se não for da coluna, ignora
            if (filterAssignee === "UNASSIGNED") return !t.assigned_to; // Mostra só sem responsável
            if (filterAssignee !== null)
              return t.assigned_to === filterAssignee; // Mostra só do usuário clicado
            return true; // Se filterAssignee for null, mostra todas
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
                                  src={`http://localhost:8000${task.assigned_to_photo}`}
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
            members={members}
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
