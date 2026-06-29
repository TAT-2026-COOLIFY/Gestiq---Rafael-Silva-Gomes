import { Link } from "react-router-dom";
import styles from "./ProjectCard.module.css";

const STATUS_MAP = {
  PLAN: { label: "A INICIAR", color: styles.statusPlan },
  ACTIVE: { label: "EM ANDAMENTO", color: styles.statusActive },
  VALID: { label: "EM VALIDAÇÃO", color: styles.statusValid },
  MONIT: { label: "EM MONITORAMENTO", color: styles.statusMonit },
  DELAY: { label: "EM ATRASO", color: styles.statusDelay },
  CONC: { label: "CONCLUÍDO", color: styles.statusConc },
  CANC: { label: "CANCELADO", color: styles.statusCanc },
};

export function ProjectCard({ project }) {
  const status = STATUS_MAP[project.project_status] ?? {
    label: project.project_status,
    color: "",
  };

  const realProgress = Number(project.total_percentage_real ?? 0);
  const planProgress = Number(project.total_percentage_plan ?? 0);
  const isDelayed = planProgress - realProgress >= 10;
  const progressColor = isDelayed
    ? "var(--danger, #ef4444)"
    : "var(--primary, #2563eb)";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{project.name}</h3>
        <span className={`${styles.statusBadge} ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className={styles.progressWrapper}>
        <div className={styles.progressInfo}>
          <span className={styles.progressLabel}>
            <strong style={{ color: progressColor }}>{realProgress}%</strong>{" "}
            {/* concluído */}
          </span>
          {/* <span className={styles.planLabel}>({planProgress}% do tempo)</span> */}
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${realProgress}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>

      <Link to={`/projeto/${project.id}`} className={styles.detailsBtn}>
        Ver Detalhes
      </Link>
    </div>
  );
}
