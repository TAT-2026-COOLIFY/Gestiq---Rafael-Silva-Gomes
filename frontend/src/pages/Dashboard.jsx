import ProjectCard from "../components/ProjectCard";
import "./Dashboard.css";

function Dashboard() {
  const projetosFalsos = [
    {
      id: 1,
      name: "Implantação SAP",
      project_type: "CORP",
      project_status: "ATIVO",
      leader_username: "Rafael",
      percentage_real: 65,
    },
    {
      id: 2,
      name: "Novo Site Institucional",
      project_type: "DEP",
      project_status: "PLANEJAMENTO",
      leader_username: "Ana",
      percentage_real: 10,
    },
    {
      id: 3,
      name: "Migração de Servidores",
      project_type: "CORP",
      project_status: "CONCLUIDO",
      leader_username: "Carlos",
      percentage_real: 100,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Meus Projetos</h1>
        <button className="new-btn">+ Novo Projeto</button>
      </div>

      <div className="projects-grid">
        {projetosFalsos.map((projeto) => (
          <ProjectCard key={projeto.id} project={projeto} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
