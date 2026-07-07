import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { Loading } from "@/components/Loading/Loading";
import { TeamModal } from "./components/TeamModal/TeamModal";
import { AnimatePresence } from "framer-motion";
import api from "@/services/api";
import styles from "./ProjectTeam.module.css";
import { MemberCard } from "./components/MemberCard/MemberCard";

export function ProjectTeam({ projectId, permissions }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [popup, setPopup] = useState(null);

  const canManageTeam = permissions?.canManageTeam || false;

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
    } catch {
      showToast("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleSave(form) {
    if (!canManageTeam) return;

    setSaving(true);
    try {
      const res = await api.post("members/", {
        project: projectId,
        email: form.email,
        function: form.function || "Participante",
      });

      setMembers((prev) => [...prev, res.data]);

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
    if (!canManageTeam) return;
    showPopup("Tem certeza que deseja remover este membro da equipe?", id);
  }

  async function handleRemove(id) {
    if (!canManageTeam) return;

    try {
      const memberToRemove = members.find((m) => m.id === id);
      const isLeader =
        memberToRemove &&
        (memberToRemove.function === "Líder" ||
          memberToRemove.function === "Lider");

      await api.delete(`members/${id}/`);

      if (isLeader) {
        await api.patch(`projects/${projectId}/`, {
          leader: null,
        });
      }

      setMembers((prev) => prev.filter((m) => m.id !== id));
      showToast("Membro removido.", "success");
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Erro ao remover membro.";
      showToast(errorMsg, "error");
    }
  }

  async function handleUpdateFunction(id, newFunction) {
    if (!canManageTeam) return;
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

  async function handleToggleLeader(member, newFunction, isBecomingLeader) {
    if (!canManageTeam) return;

    try {
      setSaving(true);
      let antigoLider = null;

      if (isBecomingLeader) {
        antigoLider = members.find(
          (m) => m.function === "Líder" || m.function === "Lider",
        );

        if (antigoLider && antigoLider.id !== member.id) {
          await api.patch(`members/${antigoLider.id}/`, {
            function: "Participante",
          });
        }
      }

      const res = await api.patch(`members/${member.id}/`, {
        function: newFunction,
      });

      const userId = member.user || member.user_id || member.id;
      await api.patch(`projects/${projectId}/`, {
        leader: isBecomingLeader ? userId : null,
      });

      setMembers((prev) =>
        prev.map((m) => {
          if (isBecomingLeader && antigoLider && m.id === antigoLider.id) {
            return { ...m, function: "Participante" };
          }
          if (m.id === member.id) {
            return { ...m, function: res.data.function };
          }
          return m;
        }),
      );

      showToast(
        isBecomingLeader ? "Novo líder nomeado!" : "Líder removido.",
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast("Erro ao alterar liderança do projeto.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h3 className={styles.sectionTitle}>Equipe do Projeto</h3>

        {canManageTeam && (
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
                canManageTeam={canManageTeam}
                onRemove={handleOpenPopup}
                onUpdateFunction={handleUpdateFunction}
                onToggleLeader={handleToggleLeader}
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
