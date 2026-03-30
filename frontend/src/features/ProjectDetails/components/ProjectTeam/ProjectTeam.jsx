import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { Loading } from "@/components/Loading/Loading";
import { TeamModal } from "./TeamModal";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import styles from "./ProjectTeam.module.css";

function MemberCard({
  member,
  onRemove,
  onUpdateFunction,
  isCurrentUserPO,
  ...props
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [funcValue, setFuncValue] = useState(member.function || "");

  const canEditingPO = isCurrentUserPO && member.username !== user?.username;

  useEffect(() => {
    setFuncValue(member.function || "");
  }, [member.function]);

  function handleBlur() {
    setEditing(false);
    if (funcValue !== member.function) {
      onUpdateFunction(member.id, funcValue);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBlur();
    if (e.key === "Escape") {
      setFuncValue(member.function || "");
      setEditing(false);
    }
  }

  return (
    <motion.div layout className={styles.card} {...props}>
      {canEditingPO && (
        <button
          className={styles.removeBtn}
          onClick={() => onRemove(member.id)}
          title="Remover membro"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className={styles.avatar}>
        {member.photo ? (
          <img src={member.photo} alt="Foto" className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarInitial}>
            {(member.nome_completo || member.username || "?")[0].toUpperCase()}
          </span>
        )}
      </div>

      <div className={styles.info}>
        <h4 className={styles.name}>
          {member.nome_completo || member.username}
        </h4>

        {canEditingPO ? (
          editing ? (
            <input
              className={styles.roleInput}
              value={funcValue}
              onChange={(e) => setFuncValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Digite a função..."
            />
          ) : (
            <span
              className={styles.role}
              onClick={() => setEditing(true)}
              title="Clique para editar a função"
            >
              {funcValue || "Definir função..."}
            </span>
          )
        ) : (
          <span
            className={
              member.function === "PO" ? styles.rolePO : styles.roleStatic
            }
          >
            {funcValue || "Sem função definida"}
          </span>
        )}

        {member.job_title && (
          <span className={styles.detail}>{member.job_title}</span>
        )}

        {member.department && (
          <span className={styles.detail}>{member.department}</span>
        )}
        <span className={styles.email}>{member.email}</span>
      </div>
    </motion.div>
  );
}

export function ProjectTeam({ projectId }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);

  const isCurrentUserPO =
    members.find(
      (m) => m.username === user?.username && m.function === "PO",
    ) !== undefined;

  const showToast = useCallback((message, type = "error") => {
    setToast({ id: Math.random(), message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const showPopup = useCallback((message, id) => {
    setPopup({ message, id });
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`members/?project=${projectId}`);
      setMembers(res.data.results ?? res.data);
    } catch (error) {
      showToast("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleSave(form) {
    setSaving(true);
    try {
      await api.post("members/", {
        project: projectId,
        email: form.email,
        function: form.function,
      });
      fetchMembers();
      setModalOpen(false);
      showToast("Membro adicionado com sucesso!", "success");
    } catch (error) {
      const msg =
        error.response?.data?.detail ??
        Object.values(error.response?.data ?? {})
          .flat()
          .join(" ") ??
        "Erro ao adicionar membro.";
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenPopup(id) {
    showPopup("Tem certeza que deseja remover este membro da equipe?", id);
  }

  async function handleRemove(id) {
    try {
      await api.delete(`members/${id}/`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      showToast("Membro removido.", "success");
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Erro ao remover membro.";
      showToast(errorMsg, "error");
    }
  }

  async function handleUpdateFunction(id, newFunction) {
    try {
      const res = await api.patch(`members/${id}/`, {
        function: newFunction,
      });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, function: res.data.function } : m,
        ),
      );
      showToast("Função atualizada!", "success");
    } catch {
      showToast("Erro ao atualizar função.");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h3 className={styles.sectionTitle}>Equipe do Projeto</h3>
        {isCurrentUserPO && (
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Convidar Membro
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum membro na equipe ainda.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className={styles.grid}>
            {members.map((member, index) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUserPO={isCurrentUserPO}
                onRemove={handleOpenPopup}
                onUpdateFunction={handleUpdateFunction}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{
                  delay: index * 0.05,
                  ease: "easeOut",
                  duration: 0.3,
                }}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {modalOpen && (
          <TeamModal
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saving={saving}
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
        {popup && (
          <Popup
            message={popup.message}
            onClose={() => setPopup(null)}
            action={() => handleRemove(popup.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
