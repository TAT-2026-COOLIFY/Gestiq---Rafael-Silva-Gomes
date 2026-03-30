import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { Loading } from "@/components/Loading/Loading";
import { AnimatePresence } from "framer-motion";
import { TimelineModal } from "./TimelineModal";
import { TimelineDrawer } from "./TimelineDrawer";
import styles from "./ProjectTimeline.module.css";

const INITIAL_MILESTONE = {
  task: "",
  start_date: "",
  end_date: "",
};

export function ProjectTimeline({ projectId }) {
  // Estados de Dados e UX
  const [tasks, setTasks] = useState([]);
  const [timelineData, setTimelineData] = useState({
    minDate: null,
    maxDate: null,
    months: [],
  });
  const [loading, setLoading] = useState(true);

  // Estados de Modais e Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_MILESTONE);

  const [selectedTask, setSelectedTask] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);

  // --- Funções Auxiliares de UX ---
  const showToast = useCallback((message, type = "error") => {
    setToast({ id: Math.random(), message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const showPopup = useCallback((message, id) => {
    setPopup({ message, id });
  }, []);

  // --- 1. Buscar Dados da API ---
  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`milestones/?project=${projectId}`);
      const data = res.data.results ?? res.data;
      setTasks(data);
      calculateTimelineBounds(data);
    } catch (error) {
      showToast("Erro ao carregar os marcos da linha do tempo.");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // --- 2. Lógica Matemática do Gráfico ---
  const calculateTimelineBounds = (milestones) => {
    if (milestones.length === 0) {
      setTimelineData({ minDate: null, maxDate: null, months: [] });
      return;
    }

    // Usamos 'T00:00:00' para evitar que o JS mude o dia por causa de fuso horário
    const startDates = milestones.map(
      (t) => new Date(`${t.start_date}T00:00:00`),
    );
    const endDates = milestones.map((t) => new Date(`${t.end_date}T00:00:00`));

    const minDate = new Date(Math.min(...startDates));
    minDate.setDate(1);
    minDate.setHours(0, 0, 0, 0);

    const maxDate = new Date(Math.max(...endDates));
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);
    maxDate.setHours(23, 59, 59, 999);

    const months = [];
    let currentMonth = new Date(minDate);
    while (currentMonth <= maxDate) {
      const monthName = new Intl.DateTimeFormat("pt-BR", {
        month: "short",
      }).format(currentMonth);
      months.push({
        label: monthName.replace(".", "").toUpperCase(),
        year: currentMonth.getFullYear(),
      });
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    setTimelineData({ minDate, maxDate, months });
  };

  const getPositionStyles = (startDateStr, endDateStr) => {
    if (!timelineData.minDate || !timelineData.maxDate) return {};

    const start = new Date(`${startDateStr}T00:00:00`).getTime();
    const end = new Date(`${endDateStr}T23:59:59`).getTime();
    const totalDuration =
      timelineData.maxDate.getTime() - timelineData.minDate.getTime();

    const leftPercentage =
      ((start - timelineData.minDate.getTime()) / totalDuration) * 100;
    const widthPercentage = ((end - start) / totalDuration) * 100;

    return {
      left: `${leftPercentage}%`,
      width: `${widthPercentage}%`,
    };
  };

  // --- 3. CRUD ---
  async function handleSave(formData) {
    setSaving(true);
    try {
      const res = await api.post("milestones/", {
        ...formData,
        project: projectId,
      });
      const newTasks = [...tasks, res.data];
      setTasks(newTasks);
      calculateTimelineBounds(newTasks); // Recalcula o gráfico

      setForm(INITIAL_MILESTONE);
      setModalOpen(false);
      showToast("Marco adicionado com sucesso!", "success");
    } catch (error) {
      showToast("Erro ao criar marco.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(formData) {
    setEditSaving(true);
    try {
      const res = await api.put(`milestones/${formData.id}/`, {
        ...formData,
        project: projectId,
      });
      const newTasks = tasks.map((t) => (t.id === res.data.id ? res.data : t));
      setTasks(newTasks);
      calculateTimelineBounds(newTasks);

      setSelectedTask(null);
      showToast("Marco atualizado com sucesso!", "success");
    } catch {
      showToast("Erro ao atualizar marco.");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`milestones/${id}/`);
      const newTasks = tasks.filter((t) => t.id !== id);
      setTasks(newTasks);
      calculateTimelineBounds(newTasks);

      setPopup(null);
      setSelectedTask(null); // Fecha a gaveta se estiver aberta
      showToast("Marco excluído com sucesso.", "success");
    } catch {
      showToast("Erro ao excluir marco.");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h3 className={styles.sectionTitle}>Cronograma do Projeto</h3>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Novo Marco
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            Nenhum marco cadastrado. Clique em "Novo Marco" para começar seu
            cronograma.
          </p>
        </div>
      ) : (
        <div className={styles.timelineWrapper}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Marcos</div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={styles.sidebarItem}
                title={task.task}
              >
                {task.task}
              </div>
            ))}
          </div>

          <div className={styles.chartArea}>
            <div className={styles.monthsHeader}>
              {timelineData.months.map((m, i) => (
                <div key={i} className={styles.monthTick}>
                  {m.label}
                </div>
              ))}
            </div>

            <div className={styles.chartContent}>
              <div className={styles.gridBackground}>
                {timelineData.months.map((_, i) => (
                  <div key={i} className={styles.gridLine}></div>
                ))}
              </div>

              {tasks.map((task) => {
                const position = getPositionStyles(
                  task.start_date,
                  task.end_date,
                );
                const progress = task.percentage_real || 0;

                return (
                  <div key={task.id} className={styles.taskRow}>
                    <div
                      className={styles.taskBar}
                      style={position}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div
                        className={styles.taskProgress}
                        style={{ width: `${progress}%` }}
                      ></div>
                      <span className={styles.taskLabel}>{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Renderização Condicional dos Componentes de UX */}
      <AnimatePresence>
        {modalOpen && (
          <TimelineModal
            key="milestone-modal"
            form={form}
            onFormChange={setForm}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {selectedTask && (
          <TimelineDrawer
            key="milestone-drawer"
            milestone={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSave={handleEdit}
            onDelete={(id) =>
              showPopup("Tem certeza que deseja excluir este marco?", id)
            }
            saving={editSaving}
          />
        )}

        {popup && (
          <Popup
            key="milestone-popup"
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
