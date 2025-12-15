import { useState, useEffect, use } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import api from "../services/api";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`projects/${id}/`)
      .then((response) => {
        setProject(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching project details:", error);
        alert(
          "Erro ao conectar ao servidor. Por favor, tente novamente mais tarde."
        );
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Carregando detalhes do projeto...</div>;
  }

  if (!project) {
    return <div>Projeto não encontrado.</div>;
  }

  return (
    <div className="details-container">
      <div className="details-header">
        <div>
          <h1>{project.name}</h1>
          <span className="id-badge">ID: #{project.id}</span>
        </div>
        <Link to="/" className="back-btn">
          Voltar
        </Link>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>Status</h3>
          <p>
            { 
              project.project_status === 'PLAN' ? 'Planejamento' : 
              project.project_status === 'ACTIVE' ? 'ATIVO' :
              project.project_status === 'CANC' ? 'Cancelado' :
              project.project_status === 'Conc' ? 'Concluído' :
              project.project_status
            }
          </p>
        </div>
        <div className="info-card">
          <h3>Líder</h3>
          <p>{project.leader_first_name + " " + project.leader_last_name || "Não definido"}</p>
        </div>
        <div className="info-card">
          <h3>Início</h3>
          <p>{formatDate(project.start_date)}</p>
        </div>
        <div className="info-card">
          <h3>Fim Previsto</h3>
          <p>{formatDate(project.end_date)}</p>
        </div>
      </div>

      <div className="project-content">
        <h2>Tarefas e Riscos</h2>
        <p className="placeholder-text">
          (Conteúdo de tarefas e riscos do projeto será exibido aqui em futuras
          atualizações.)
        </p>
      </div>
    </div>
  );
}
export default ProjectDetails;
