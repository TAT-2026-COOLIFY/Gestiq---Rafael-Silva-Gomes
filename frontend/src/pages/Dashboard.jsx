import { useState, useEffect, use } from "react";
import api from "../services/api";
import ProjectCard from "../components/ProjectCard";
import "./Dashboard.css";

function Dashboard() {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("projects/")
      .then((response) => {
        console.log("Chegou a pizza!", response.data);
        setProjects(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        alert(
          "Erro ao conectar ao servidor. Por favor, tente novamente mais tarde."
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Carregando projetos...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Meus Projetos</h1>
        <button className="new-btn">+ Novo Projeto</button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {projects.length === 0 && <p>Nenhum projeto encontrado.</p>}
      </div>
    </div>
  );
}

export default Dashboard;
