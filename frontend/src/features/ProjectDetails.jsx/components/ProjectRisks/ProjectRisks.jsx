import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";
import { Toast } from "@/components/Toast";
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
}

const SCORE_OPTIONS = [
    { value: "0.10", label: "Muito Baixo" },
    { value: "0.30", label: "Baixo" },
    { value: "0.50", label: "Médio" },
    { value: "0.70", label: "Alto" },
    { value: "0.90", label: "Muito Alto" },
];

const CATEGORY_MAP = {
    TEC: "Técnico",
    EXT: "Externo",
    ORG: "Organizacional",
    GP: "Gestão de Proj.",
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
    const [loading, setLoading] = useState([true]);
    const [saving, setSaving] = useState([false]);
    const [newRisk, setNewRisk] = useState(INITIAL_RISK);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
    }, []);

    const fetchRisks = useCallback(() => {
        api.get(`risks/?project=${projectId}`)
            .then((res) => setRisks(res.data.result ?? res.data))
            .catch(() => showToast("Erro ao carregar riscos."))
            .finally(() => setLoading(false));
    }, [projectId, showToast]);

    useEffect(() => {
        fetchRisks();
    }, [fetchRisks]);

    function handleChange(e) {
        const { name, value } = e.target;
        setNewRisk((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post("risks/", {
                project: projectId,
                description: newRisk.description,
                category: newRisk.category,
                action_plan: newRisk.mitigation_plan,
                cost: newRisk.cost,
                timeline: newRisk.timeline,
                scope: newRisk.scope,
                quality: newRisk.quality,
                probability: newRisk.probability,
                action: newRisk.action,
                status: "INICIAR",
            });
            setRisks((prev) => [...prev, res.data]);
            setNewRisk(INITIAL_RISK);
            showToast("Risco adicionado com sucesso!", "success");
        } catch (error) {
            const msg = error.response?.data
                ? Object.values(error.response.data).flat().join(" ")
                : "Erro ao criar riscos.";
            showToast(msg);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Tem certeza que deseja excluir este risco?")) return;
        try {
            await api.delete(`risks/${id}/`);
            setRisks((prev) => prev.filter((r) => r.id !== id));
            showToast("Risco excluído.", "success");
        } catch {
            showToast("Erro ao excluir risco.");
        }
    }

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner} />
            </div>
        );
    }
    
    return (
        <div className={styles.container}>

            {/* Formulário */}
            <div className={styles.formBox}>
                <h3 className={styles.formTitle}>Adicionar Novo Risco</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Descrição</label>
                            <input
                                name="description"
                                value={newRisk.description}
                                onChange={handleChange}
                                placeholder="Descreva o risco..."
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Categoria</label>
                            <select name="category" value={newRisk.category} onChange={handleChange}>
                                <option value="TEC">Técnico</option>
                                <option value="EXT">Externo</option>
                                <option value="ORG">Organizacional</option>
                                <option value="GP">Gestão de Proj.</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ação</label>
                            <select name="action" value={newRisk.action} onChange={handleChange}>
                                <option value="MITIGAR">Mitigar</option>
                                <option value="ACEITAR">Aceitar</option>
                                <option value="TRANSFERIR">Transferir</option>
                                <option value="ELIMINAR">Eliminar</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Plano de Ação</label>
                            <input
                                name="mitigation_plan"
                                value={newRisk.mitigation_plan}
                                onChange={handleChange}
                                placeholder="Descreva o plano..."
                            />
                        </div>
                    </div>

                    <div className={styles.scoresGrid}>
                        {[
                            { name: "cost", label: "Custo" },
                            { name: "timeline", label: "Cronograma" },
                            { name: "scope", label: "Escopo" },
                            { name: "quality", label: "Qualidade" },
                            { name: "probability", label: "Probabilidade" },
                        ].map((field) => (
                            <div key={field.name} className={styles.formGroup}>
                                <label>{field.label}</label>
                                <select name={field.name} value={newRisk[field.name]} onChange={handleChange}>
                                    {SCORE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.addBtn} disabled={saving}>
                            <Plus size={16} />
                            {saving ? "Adicionando..." : "Adicionar Risco"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tabela */}
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
                            {risks.map((risk) => {
                                const score = parseFloat(risk.score ?? 0);
                                const level = getScoreLevel(score);
                                return (
                                    <tr key={risk.id}>
                                        <td>{risk.description}</td>
                                        <td>{CATEGORY_MAP[risk.category] ?? risk.category}</td>
                                        <td>
                                            <span className={`${styles.scoreBadge} ${styles[level]}`}>
                                                {score.toFixed(2)}
                                            </span>
                                        </td>
                                        <td>{ACTION_MAP[risk.action] ?? risk.action}</td>
                                        <td>{risk.action_plan ?? "—"}</td>
                                        <td>{STATUS_MAP[risk.status] ?? risk.status}</td>
                                        <td>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(risk.id)}
                                                title="Excluir risco"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
