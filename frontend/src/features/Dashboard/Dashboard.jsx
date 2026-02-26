import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { dashboardService } from "./services/dashboardService";
import { ProjectCard } from "./components/ProjectCard";
import { Toast } from "@/components/Toast";
import styles from "./Dashboard.module.css";

const TABS = [
    { key: "CORP", label: "Corporativos" },
    { key: "DEP",  label: "Departamentais" },
];

export function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState("CORP");
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
    }, []);

    useEffect(() => {
        dashboardService.getProjects()
            .then(setProjects)
            .catch(() => showToast("Erro ao carregar projetos. Tente novamente."))
            .finally(() => setLoading(false));
    }, [showToast]);

    const filtered = projects.filter((p) => p.project_type === activeTab);

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Meus Projetos</h1>
                    <p>{projects.length} projeto{projects.length !== 1 ? "s" : ""} encontrado{projects.length !== 1 ? "s" : ""}</p>
                </div>
                <Link to="/projeto/novo" className={styles.newBtn}>
                    <Plus size={18} />
                    Novo Projeto
                </Link>
            </div>

            <div className={styles.tabs}>
                {TABS.map((tab) => {
                    const count = projects.filter((p) => p.project_type === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            <span className={styles.tabCount}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Nenhum projeto {activeTab === "CORP" ? "corporativo" : "departamental"} encontrado.</p>
                    <Link to="/projeto/novo" className={styles.newBtn}>
                        <Plus size={18} />
                        Criar projeto
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

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