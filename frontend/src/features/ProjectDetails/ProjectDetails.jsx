import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/services/api";

import { useAuth } from "@/hooks/useAuth";

import { ProjectRisks } from "./components/ProjectRisks/ProjectRisks";
import { ProjectCommunications } from "./components/ProjectCommunications/ProjectCommunications";
import { ProjectTeam } from "./components/ProjectTeam/ProjectTeam";
import { ProjectCanvas } from "./components/ProjectCanvas/ProjectCanvas";
import { ProjectTimeline } from "./components/ProjectTimeline/ProjectTimeline";
import { ProjectKanban } from "./components/ProjectKanban/ProjectKanban";
import { ProjectScrum } from "./components/ProjectBacklog/ProjectScrum";

import { motion as Motion, AnimatePresence } from "framer-motion";
import { Loading } from "@/components/Loading/Loading";
import styles from "./ProjectDetails.module.css";

const STATUS_MAP = {
  PLAN: { label: "A Iniciar", color: styles.statusPlan },
  ACTIVE: { label: "Em Andamento", color: styles.statusActive },
  CONC: { label: "Concluído", color: styles.statusConc },
  CANC: { label: "Cancelado", color: styles.statusCanc },
};

const TABS = [
  { key: "canvas", label: "Project Canvas", component: ProjectCanvas },
  { key: "riscos", label: "Riscos", component: ProjectRisks },
  {
    key: "comunicacoes",
    label: "Comunicações",
    component: ProjectCommunications,
  },
  { key: "membros", label: "Equipe", component: ProjectTeam },
  { key: "milestones", label: "Linha do Tempo", component: ProjectTimeline },
  { key: "kanban", label: "Kanban", component: ProjectKanban },
  { key: "Scrum", label: "Scrum", component: ProjectScrum },
];

export function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  // console.log("DADOS DO USUÁRIO LOGADO:", user);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("canvas");
  const [direction, setDirection] = useState("right");

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`projects/${id}/`);
      console.log("DADOS DO PROJETO:", response.data);
      setProject(response.data);
    } catch (error) {
      console.error("Erro ao carregar projeto:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project) document.title = `${project.name} | Gestiq`;
  }, [project]);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;

    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    const newIndex = TABS.findIndex((t) => t.key === newTab);

    setDirection(newIndex > currentIndex ? "right" : "left");
    setActiveTab(newTab);
  };

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

  const isPO = project.po === Number(user?.id);
  const isLeader = project.leader === Number(user?.id);

  const permissions = {
    canEditCanvas: isPO || isLeader,
    canEditRisks: isPO || isLeader,
    canEditCommunications: isPO || isLeader,
    canManageTeam: isPO,
    canEditTimeline: isPO,
    canManageKanban: true,
  };

  const status = STATUS_MAP[project.project_status] ?? {
    label: project.project_status,
    color: "",
  };

  const ActiveTabComponent = TABS.find(
    (tab) => tab.key === activeTab,
  )?.component;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.projectName}>{project.name}</h1>
          <span className={`${styles.statusBadge} ${status.color}`}>
            {status.label}
          </span>
        </div>
        <Link to="/" className={styles.backBtn} aria-label="Voltar para início">
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>

      <nav className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={activeTab}
            initial={{ opacity: 0, x: direction === "right" ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === "right" ? -40 : 20 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {ActiveTabComponent ? (
              <ActiveTabComponent projectId={id} permissions={permissions} />
            ) : (
              <p>Selecione uma aba válida.</p>
            )}
          </Motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
