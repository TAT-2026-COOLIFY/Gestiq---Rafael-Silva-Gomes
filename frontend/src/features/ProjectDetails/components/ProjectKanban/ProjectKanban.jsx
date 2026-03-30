import { useState, useEffect, useCallback } from "react";
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
};

export function ProjectKanban({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]); // Para preencher os selects
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_TASK);

  const [selectedTask, setSelectedTask] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);

  // Estado para UX do Drag and Drop (Saber qual coluna está recebendo o card)
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
      const [tasksRes, milestonesRes] = await Promise.all([
        api.get(`activities/?project=${projectId}`),
        api.get(`milestones/?project=${projectId}`),
      ]);

      setTasks(tasksRes.data.results ?? tasksRes.data);
      setMilestones(milestonesRes.data.results ?? milestonesRes.data);
    } catch (error) {
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
    } catch (error) {
      setTasks(previousTasks);
      showToast("Erro ao mover a tarefa.");
    }
  };

  // --- 3. CRUD Padrão ---
  async function handleSave(formData) {
    setSaving(true);
    try {
      const payload = { ...formData, project: projectId };
      // Se não selecionou milestone, manda nulo pro backend
      if (!payload.milestone || payload.milestone === "") {
        payload.milestone = null;
      }

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
        <h3 className={styles.sectionTitle}>Quadro Kanban</h3>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      <div className={styles.boardWrapper}>
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className={`${styles.column} ${styles[`column${col.id}`]}`}>
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
                        {linkedMilestone && (
                          <span className={styles.taskMilestone}>
                            {linkedMilestone.task}
                          </span>
                        )}
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
          />
        )}
        {selectedTask && (
          <KanbanDrawer
            key="task-drawer"
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleEdit}
            onDelete={(id) => showPopup("Tem certeza que deseja excluir esta tarefa?", id)}
            saving={editSaving}
            milestones={milestones}
            columns={COLUMNS}
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
