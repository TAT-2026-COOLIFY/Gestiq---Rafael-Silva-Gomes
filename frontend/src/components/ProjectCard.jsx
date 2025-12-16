import { Link } from "react-router-dom";
import "./ProjectCard.css";

// Recebemos "project" como propriedade (props)
function ProjectCard({ project }) {
  // Funçãozinha para definir a cor da bolinha do status
  const getStatusColor = (status) => {
    switch (status) {
      case "PLAN":
        return "orange";
      case "ACTIVE":
        return "blue";
      case "CONC":
        return "green";
      case "CANC":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="project-card">
      <div className="card-header">
        <span className="project-type">{project.project_type}</span>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(project.project_status) }}
        >
          { project.project_status === 'PLAN' ? 'Planejamento' : 
            project.project_status === 'ACTIVE' ? 'ATIVO' :
            project.project_status === 'CANC' ? 'Cancelado' :
            project.project_status === 'CONC' ? 'Concluído' :
            project.project_status
          }
        </span>
      </div>

      <h3>{project.name}</h3>

      <p className="leader">
        Líder: <strong>{project.leader_first_name + " " + project.leader_last_name || "Não definido"}</strong>
      </p>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${project.percentage_real}%` }}
        ></div>
      </div>
      <span className="percentage">{project.percentage_real}% Concluído</span>

      <Link to={`/projeto/${project.id}`} className="details-btn">
        Ver Detalhes
      </Link>
    </div>
  );
}

export default ProjectCard;
