import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/services/api";
import { ProjectRisks } from "./components/ProjectRisks/ProjectRisks";
import { ProjectCommunications } from "./components/ProjectCommunications/ProjectCommunications";
//TODO: TROCAR OS CAMINHOS CONFORME REFATORAR AS OUTRAS SESSÕES
import ProjectCanvas from "@/components/ProjectCanvas";
import ProjectKanban from "@/components/ProjectKanban";
import ProjectTeam from "@/components/ProjectTeam";

import ProjectMilestones from "@/components/ProjectMilestones";

import { Loading } from "@/components/Loading/Loading";
import styles from "./ProjectDetails.module.css";

const STATUS_MAP = {
    PLAN : { label: "A Iniciar", color: styles.statusPlan },
    ACTIVE : { label: "Em Andamento", color: styles.statusActive },
    CONC : { label: "Concluído", color: styles.statusConc },
    CANC : { label: "Cancelado", color: styles.statusCanc },
};

const TABS = [
    { key: "canvas", label: "Project Canvas" },
    { key: "riscos", label: "Riscos "},
    { key: "comunicacoes", label: "Comunicações" },
    { key: "membros", label: "Equipe" },
    { key: "milestones", label: "Linha do Tempo" },
    { key: "kanban", label: "Kanban" },
];

export function ProjectDetails() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("canvas");
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState("right");

    useEffect(() => {
        if (project) document.title = `${project.name} | Gestiq`;
    }, [project]);

    function handleTabChange(newTab) {
        const currentIndex = TABS.findIndex((t) => t.key === activeTab);
        const newIndex = TABS.findIndex((t) => t.key === newTab);

        setDirection(newIndex > currentIndex ? "right" : "left");
        setAnimating(true);

        setTimeout(() => {
            setActiveTab(newTab);
            setAnimating(false);
        }, 150);
    }

    const fetchProject = useCallback(() => {
        api.get(`projects/${id}/`)
            .then((res) => setProject(res.data))
            .catch(() => setProject(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    if (loading) return <Loading />;

    if (!project) {
        return (
            <div className={styles.notFound}>
                <p>Projeto Não Encontrado.</p>
                <Link to="/" className={styles.backBtn}>
                    <ArrowLeft size={16} /> Voltar
                </Link>
            </div>  
        );
    }

    const status = STATUS_MAP[project.project_status] ?? { label: project.project_status, color: "" };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1 className={styles.projectName}>{project.name}</h1>
                    <span className={`${styles.statusBadge} ${status.color}`}>
                        {status.label}
                    </span>
                </div>
                <Link to="/" className={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Voltar
                </Link>
            </div>

            <div className={styles.tabs}>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.label}                        
                    </button>
                ))}
            </div>

            <div className={`
                ${styles.content}
                ${animating ? "" : direction === "right" ? styles.contentAnimateRight : styles.contentAnimateLeft}    
            `}>
                {activeTab === "canvas"       && <ProjectCanvas projectId={id} />}
                {activeTab === "riscos"       && <ProjectRisks projectId={id} />}
                {activeTab === "comunicacoes" && <ProjectCommunications projectId={id} />}
                {activeTab === "membros"      && <ProjectTeam projectId={id} />}
                {activeTab === "kanban"       && <ProjectKanban projectId={id} />}
                {activeTab === "milestones"   && <ProjectMilestones projectId={id} />}
            </div>
        </div>
    );
}


