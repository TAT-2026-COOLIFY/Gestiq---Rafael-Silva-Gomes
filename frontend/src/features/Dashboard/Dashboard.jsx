import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { dashboardService } from "./services/dashboardService";
import ProjectCard from "@/components/ProjectCard";
import { Toast } from "@/components/Toast";
import styles from "./Dashboard.module.css";

export function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
    }, []);

    useEffect(() => {
        dashboardService.getProjects()
            .then(setProjects)
            .catch(() => showToast("Erro ao carregar projetos. Tente Novamente."))
            .finally(() => setLoading(false));
    }, [showToast]);

    if ( loading ) {
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

            {projects.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Nenhum projeto encontrado</p>
                    <Link to="/projeto/novo" className={styles.newBtn}>
                        <Plus size={18} />
                        Criar primeiro projeto
                    </Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {projects.map((project) => (
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