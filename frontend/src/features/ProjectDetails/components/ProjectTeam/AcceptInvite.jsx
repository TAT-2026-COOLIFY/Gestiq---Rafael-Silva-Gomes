import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { Loading } from "@/components/Loading/Loading";
import { Toast } from "@/components/Toast";
import styles from "./AcceptInvite.module.css";

export function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  if (authLoading) return <Loading />;

  async function handleAccept() {
    setLoading(true);
    try {
      const response = await api.post(`invitations/accept/${token}/`);

      const projectId = response.data.project_id;
      navigate(`/projeto/${projectId}`);
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao aceitar o convite.";
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Convite para Projeto</h2>

        {!user ? (
          <div className={styles.warningBox}>
            <p>Você precisa estar logado para aceitar este convite.</p>
            <p className={styles.hint}>
              Faça login com o e-mail no qual você recebeu o convite.
            </p>
            <div className={styles.actions}>
              <Link to="/login" className={styles.loginBtn}>
                Ir para o Login
              </Link>
              {/* Opcional: <Link to="/register">Criar Conta</Link> */}
            </div>
          </div>
        ) : (
          <div className={styles.successBox}>
            <p>
              Olá, <strong>{user.first_name || user.username}</strong>!
            </p>
            <p>Você foi convidado para participar de um projeto.</p>

            <button
              className={styles.acceptBtn}
              onClick={handleAccept}
              disabled={loading}
            >
              {loading ? "Processando..." : "Aceitar Convite"}
            </button>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
