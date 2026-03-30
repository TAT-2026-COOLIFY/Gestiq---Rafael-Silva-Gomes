import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { CommunicationModal } from "./CommunicationModal";
import { CommunicationDrawer } from "./CommunicationDrawer";
import api from "@/services/api";
import { Loading } from "@/components/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ProjectCommunications.module.css";

const INITIAL_COMMUNICATION = {
  description: "",
  objective: "",
  sender: "",
  recipient: "",
  channel: "EMAIL",
  frequency: "ONCE",
};

const CHANNEL_MAP = {
  EMAIL: "E-mail",
  TEAMS: "Teams",
  WHATS: "WhatsApp",
  PHONE: "Telefone",
  MEET: "Reunião Presencial",
  OL_MEET: "Reunião Online",
};

const FREQUENCY_MAP = {
  ONCE: "Uma única vez",
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
  MEETING: "Após cada reunião",
  NEEDED: "Conforme Necessário",
};

export function ProjectCommunications({ projectId }) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_COMMUNICATION);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);

  const showToast = useCallback((message, type = "error") => {
    setToast({ id: Math.random(), message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const showPopup = useCallback((message, id) => {
    setPopup({ message, id });
  }, []);

  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`communications/?project=${projectId}`);
      setCommunications(res.data.results ?? res.data);
    } catch (error) {
      showToast("Erro ao carregar comunicações");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  async function handleSave(form) {
    setSaving(true);
    try {
      const res = await api.post("communications/", {
        project: projectId,
        description: form.description,
        objective: form.objective,
        sender: form.sender,
        recipient: form.recipient,
        channel: form.channel,
        frequency: form.frequency,
      });
      setCommunications((prev) => [...prev, res.data]);
      setForm(INITIAL_COMMUNICATION);
      setModalOpen(false);
      showToast("Comunicação adicionada com sucesso!", "success");
    } catch (error) {
      const msg = error.response?.data
        ? Object.values(error.response.data).flat().join(" ")
        : "Erro ao criar risco.";
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenPopup(id) {
    showPopup("Tem certeza que deseja excluir esta comunicação?", id);
  }

  async function handleDelete(id) {
    try {
      await api.delete(`communications/${id}/`);
      setCommunications((prev) => prev.filter((r) => r.id !== id));
      setSelectedCommunication(null);
      showToast("Comunicação excluída.", "success");
    } catch {
      showToast("Erro ao excluir comunicação.");
    }
  }

  async function handleEdit(form) {
    setEditSaving(true);
    try {
      const res = await api.put(`communications/${form.id}/`, {
        project: projectId,
        description: form.description,
        objective: form.objective,
        sender: form.sender,
        recipient: form.recipient,
        channel: form.channel,
        frequency: form.frequency,
      });
      setCommunications((prev) =>
        prev.map((r) => (r.id === res.data.id ? res.data : r)),
      );
      setSelectedCommunication(null);
      showToast("Comunicação atualziada com sucesso!", "success");
    } catch {
      showToast("Erro ao atualizar comunicação.");
    } finally {
      setEditSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h3 className={styles.sectionTitle}>Matriz de Comunicação</h3>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nova Comunicação
        </button>
      </div>

      {communications.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma comunicação cadastrada para este projeto.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Objetivo</th>
                <th>Remetente</th>
                <th>Destinatário</th>
                <th>Meio</th>
                <th>Frequência</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {communications.map((communication, index) => (
                  <motion.tr
                    key={communication.id}
                    className={styles.tableRow}
                    onClick={() => setSelectedCommunication(communication)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: index * 0.05,
                      ease: "easeOut",
                      duration: 0.2,
                    }}
                  >
                    <td>{communication.description}</td>
                    <td>{communication.objective}</td>
                    <td>{communication.sender}</td>
                    <td>{communication.recipient}</td>
                    <td>
                      {CHANNEL_MAP[communication.channel] ??
                        communication.channel}
                    </td>
                    <td>
                      {FREQUENCY_MAP[communication.frequency] ??
                        communication.frequency}
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPopup(communication.id);
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <CommunicationModal
            form={form}
            onFormChange={setForm}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {selectedCommunication && (
          <CommunicationDrawer
            communication={selectedCommunication}
            onClose={() => setSelectedCommunication(null)}
            onSave={handleEdit}
            saving={editSaving}
          />
        )}

        {popup && (
          <Popup
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
