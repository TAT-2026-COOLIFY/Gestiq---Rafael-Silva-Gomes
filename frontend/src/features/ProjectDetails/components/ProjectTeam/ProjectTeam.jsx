import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, MoreVertical, Crown } from "lucide-react";
import { Toast } from "@/components/Toast";
import { Popup } from "@/components/Popup";
import { Loading } from "@/components/Loading/Loading";
import { TeamModal } from "./TeamModal";
import { useAuth } from "@/hooks/useAuth";
import { motion as Motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import styles from "./ProjectTeam.module.css";

function MemberCard({
  member,
  onRemove,
  onUpdateFunction,
  onToggleLeader,
  canManageTeam,
  ...props
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [funcValue, setFuncValue] = useState(member.function || "");
  const [menuOpen, setMenuOpen] = useState(false); // 👈 Controle do menu de 3 pontinhos

  // 👇 Verificações de papéis
  const isPO = member.function === "PO";
  const isLeader = member.function === "Líder" || member.function === "Lider";
  const isSpecialRole = isPO || isLeader;
  const canEditThisMember = canManageTeam && member.username !== user?.username;
  const canInlineEditRole = canEditThisMember && !isSpecialRole;

  function handleBlur() {
    setEditing(false);
    const trimmedValue = funcValue.trim();

    if (!trimmedValue) {
      setFuncValue(member.function || "");
      return;
    }

    if (trimmedValue !== member.function) {
      onUpdateFunction(member.id, trimmedValue);
    } else {
      setFuncValue(member.function || "");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBlur();
    if (e.key === "Escape") {
      setFuncValue(member.function || "");
      setEditing(false);
    }
  }

  function toggleLeader() {
    setMenuOpen(false);
    const isBecomingLeader = !isLeader;
    const newFunction = isBecomingLeader ? "Líder" : "Participante";

    onToggleLeader(member, newFunction, isBecomingLeader);
  }

  return (
    <Motion.div
      layout
      className={styles.card}
      {...props}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* 👇 2. O Menu de 3 Pontinhos (Aparece apenas para o PO gerenciar outros membros) */}
      {canEditThisMember && (
        <div className={styles.actionMenu}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            title="Opções do Membro"
          >
            <MoreVertical size={18} />
          </button>

          {/* O Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <Motion.div
                className={styles.dropdown}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {!isPO && (
                  <button
                    onClick={toggleLeader}
                    className={styles.dropdownItem}
                  >
                    <Crown size={14} />
                    {isLeader ? "Remover Líder" : "Tornar Líder"}
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove(member.id);
                  }}
                  className={`${styles.dropdownItem} ${styles.dropdownDelete}`}
                >
                  <Trash2 size={14} /> Expulsar
                </button>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
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

        {canInlineEditRole ? (
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
              title="Clique para editar a função"
              onClick={() => {
                setFuncValue(member.function || "");
                setEditing(true);
              }}
            >
              {member.function || "Definir função..."}
            </span>
          )
        ) : (
          // Modo Estático (PO, Líder ou usuário sem permissão)
          <span
            className={
              isPO
                ? styles.rolePO
                : isLeader
                  ? styles.roleLeader
                  : styles.roleStatic
            }
          >
            {member.function || "Sem função definida"}
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
    </Motion.div>
  );
}

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
      await api.post("members/", {
        project: projectId,
        email: form.email,
        function: form.function || "Participante",
      });

      await fetchMembers();
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

      if (isBecomingLeader) {
        const antigoLider = members.find(
          (m) => m.function === "Líder" || m.function === "Lider",
        );

        if (antigoLider && antigoLider.id !== member.id) {
          await api.patch(`members/${antigoLider.id}/`, {
            function: "Participante",
          });
        }
      }

      await api.patch(`members/${member.id}/`, {
        function: newFunction,
      });

      const userId = member.user || member.user_id || member.id;
      await api.patch(`projects/${projectId}/`, {
        leader: isBecomingLeader ? userId : null,
      });

      await fetchMembers();

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
