import { Link } from "react-router-dom";
import styles from "./ProjectCard.module.css";

const STATUS_MAP = {
  PLAN: { label: "A INICIAR", color: styles.statusPlan },
  ACTIVE: { label: "EM ANDAMENTO", color: styles.statusActive },
  VALID: { label: "EM VALIDAÇÃO", color: styles.statusValid },
  MONIT: { label: "EM MONITORAMENTO", color: styles.statusMonit},
  DELAY: { label: "EM ATRASO", color: styles.statusDelay},
  CONC: { label: "CONCLUÍDO", color: styles.statusConc },
  CANC: { label: "CANCELADO", color: styles.statusCanc },
};

export function ProjectCard({ project }) {
  const status = STATUS_MAP[project.project_status] ?? {
    label: project.project_status,
    color: "",
  };
  const progress = Number(project.percentage_real ?? 0);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{project.name}</h3>
        <span className={`${styles.statusBadge} ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressLabel}>{progress}% concluído</span>
      </div>

      <Link to={`/projeto/${project.id}`} className={styles.detailsBtn}>
        Ver Detalhes
      </Link>
    </div>
  );
}
