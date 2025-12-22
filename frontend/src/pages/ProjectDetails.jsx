import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // useParams pega o ID da URL
import api from "../services/api";
import ProjectCanvas from "../components/ProjectCanvas";
import ProjectKanban from '../components/ProjectKanban';
import ProjectRisks from "../components/ProjectRisks";
import ProjectTeam from "../components/ProjectTeam";
import ProjectCommunications from "../components/ProjectCommunications";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams(); // Pega o número que está na URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("canvas"); // Controla qual aba está visível

  useEffect(() => {
    // Busca os dados DO PROJETO ESPECÍFICO
    api.get(`projects/${id}/`)
      .then((response) => {
        setProject(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar projeto:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Carregando projeto...</div>;
  if (!project) return <div>Projeto não encontrado.</div>;

  return (
    <div className="details-container">
      {/* 1. Cabeçalho do Projeto */}
      <div className="project-header">
        <div>
            <h1>{project.name}</h1>
            <span className={`status-badge ${project.project_status}`}>
                { project.project_status === 'PLAN' ? 'Planejamento' : 
                  project.project_status === 'ACTIVE' ? 'ATIVO' :
                  project.project_status === 'CANC' ? 'Cancelado' :
                  project.project_status === 'CONC' ? 'Concluído' :
                  project.project_status
                }
            </span>
        </div>
        <Link to="/" className="btn-back">Voltar</Link>
      </div>

      {/* 2. Menu de Abas (Navegação Interna) */}
      <div className="project-tabs">
        <button 
            className={activeTab === 'canvas' ? 'active' : ''} 
            onClick={() => setActiveTab('canvas')}
        >
            📜 Project Canvas
        </button>
        <button 
            className={activeTab === 'riscos' ? 'active' : ''} 
            onClick={() => setActiveTab('riscos')}
        >
            ⚠️ Riscos
        </button>
        <button 
            className={activeTab === 'comunicacoes' ? 'active' : ''} 
            onClick={() => setActiveTab('comunicacoes')}
        >
            👥 Comunicações
        </button>
        <button 
          className={activeTab === 'membros' ? 'active' : ''} 
          onClick={() => setActiveTab('membros')}
        >
          👥 Equipe
        </button>
        <button
          className={activeTab === 'kanban' ? 'active' : ''}
          onClick={() => setActiveTab('kanban')}
        >
          Kanban
        </button>
      </div>

      {/* 3. Área de Conteúdo (Muda conforme a aba) */}
      <div className="tab-content">
        {activeTab === 'canvas' && (
            <div className="canvas-area">
                <ProjectCanvas projectId={id} />
            </div>
        )}

        {activeTab === 'riscos' && (
            <div className="risks-area">
                <ProjectRisks projectId={id} />
            </div>
        )}

        {activeTab === 'comunicacoes' && (
            <div className="communications-area">
                <ProjectCommunications projectId={id} />
            </div>
        )}
        
        {activeTab === 'membros' && (
            <div className="members-area">
                <ProjectTeam projectId={id}/>
            </div>
        )}
        {activeTab === 'kanban' && (
          <div className="kanban-area">
            <ProjectKanban projectId={id} />
          </div>
        )}  
      </div>
    </div>
  );
}

export default ProjectDetails;