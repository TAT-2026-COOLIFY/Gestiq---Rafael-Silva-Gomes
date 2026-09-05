import { useState } from "react";
import { Trash2, MoreVertical, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion as Motion, AnimatePresence } from "framer-motion";
import styles from "./MemberCard.module.css";

export function MemberCard({
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
  const [menuOpen, setMenuOpen] = useState(false);

  const isProjectManager = member.function === "Gestor do Projeto";
  const isLeader = member.function === "Líder" || member.function === "Lider";
  const isSpecialRole = isProjectManager || isLeader;
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
      {canEditThisMember && (
        <div className={styles.actionMenu}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            title="Opções do Membro"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <Motion.div
                className={styles.dropdown}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {!isProjectManager && (
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
          <span
            className={
              isProjectManager
                ? styles.roleProjectManager
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
