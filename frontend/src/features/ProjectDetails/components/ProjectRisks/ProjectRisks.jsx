import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { RiskModal } from "./RiskModal";
import { RiskDrawer } from "./RiskDrawer";
import { Loading } from "@/components/Loading/Loading";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import styles from "./ProjectRisks.module.css";

const INITIAL_RISK = {
  description: "",
  category: "TEC",
  action: "MITIGAR",
  cost: "0.10",
  timeline: "0.10",
  scope: "0.10",
  quality: "0.10",
  probability: "0.10",
  mitigation_plan: "",
};

const CATEGORY_MAP = {
  TEC: "Técnico",
  EXT: "Externo",
  ORG: "Organizacional",
  GP: "Gestão de Projetos",
};

const ACTION_MAP = {
  MITIGAR: "Mitigar",
  ACEITAR: "Aceitar",
  TRANSFERIR: "Transferir",
  ELIMINAR: "Eliminar",
};

const STATUS_MAP = {
  INICIAR: "A Iniciar",
  ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
};

function getScoreLevel(score) {
  if (score >= 0.45) return "high";
  if (score >= 0.21) return "medium";
  return "low";
}

export function ProjectRisks({ projectId }) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_RISK);
  const [selectedRisk, setSelectedRisk] = useState(null);
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

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`risks/?project=${projectId}`);
      setRisks(res.data.results ?? res.data);
    } catch (error) {
      showToast("Erro ao carregar riscos");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  async function handleSave(form) {
    setSaving(true);
    try {
      const res = await api.post("risks/", {
        project: projectId,
        description: form.description,
        category: form.category,
        action_plan: form.mitigation_plan,
        cost: form.cost,
        timeline: form.timeline,
        scope: form.scope,
        quality: form.quality,
        probability: form.probability,
        action: form.action,
        status: "INICIAR",
      });
      setRisks((prev) => [...prev, res.data]);
      setForm(INITIAL_RISK);
      setModalOpen(false);
      showToast("Risco adicionado com sucesso!", "success");
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
    showPopup("Tem certeza que deseja excluir este risco?", id);
  }

  async function handleDelete(id) {
    try {
      await api.delete(`risks/${id}/`);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      showToast("Risco excluído.", "success");
    } catch {
      showToast("Erro ao excluir risco.");
    }
  }

  async function handleEdit(form) {
    setEditSaving(true);
    try {
      const res = await api.put(`risks/${form.id}/`, {
        project: projectId,
        description: form.description,
        category: form.category,
        action_plan: form.action_plan,
        cost: form.cost,
        timeline: form.timeline,
        scope: form.scope,
        quality: form.quality,
        probability: form.probability,
        action: form.action,
        status: form.status,
      });
      setRisks((prev) =>
        prev.map((r) => (r.id === res.data.id ? res.data : r)),
      );
      setSelectedRisk(null);
      showToast("Risco atualizado com sucesso!", "success");
    } catch {
      showToast("Erro ao atualizar risco.");
    } finally {
      setEditSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h3 className={styles.sectionTitle}>Riscos do Projeto</h3>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Novo Risco
        </button>
      </div>

      {risks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum risco cadastrado para este projeto.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Score</th>
                <th>Ação</th>
                <th>Plano de Ação</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {risks.map((risk, index) => {
                  const score = parseFloat(risk.score ?? 0);
                  const level = getScoreLevel(score);

                  return (
                    <motion.tr
                      key={risk.id}
                      className={styles.tableRow}
                      onClick={() => setSelectedRisk(risk)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        delay: index * 0.05,
                        ease: "easeOut",
                        duration: 0.2,
                      }}
                    >
                      <td>{risk.description}</td>
                      <td>{CATEGORY_MAP[risk.category] ?? risk.category}</td>
                      <td>
                        <span
                          className={`${styles.scoreBadge} ${styles[level]}`}
                        >
                          {score.toFixed(2)}
                        </span>
                      </td>
                      <td>{ACTION_MAP[risk.action] ?? risk.action}</td>
                      <td>{risk.action_plan ?? "—"}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${styles[`status_${risk.status}`]}`}
                        >
                          {STATUS_MAP[risk.status] ?? risk.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPopup(risk.id);
                          }}
                          title="Excluir risco"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <RiskModal
            form={form}
            onFormChange={setForm}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {selectedRisk && (
          <RiskDrawer
            risk={selectedRisk}
            onClose={() => setSelectedRisk(null)}
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
