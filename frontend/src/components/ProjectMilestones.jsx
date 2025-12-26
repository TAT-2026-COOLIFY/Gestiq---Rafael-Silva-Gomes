import { useEffect, useState } from "react";
// Importa a biblioteca nova e os tipos
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css"; // <--- IMPORTANTE: O CSS PADRÃO
import api from "../services/api";
import "./ProjectMilestones.css";

const PortugueseHeader = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
  return (
    <div
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        height: headerHeight,
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f8f9fa", // Cor de fundo do cabeçalho
        borderBottom: "1px solid #e0e0e0",
        borderTopLeftRadius: "5px",
        fontWeight: "bold",
        color: "#495057"
      }}
    >
      <div style={{ flex: 1, paddingLeft: "15px", minWidth: rowWidth }}>
        Tarefa
      </div>
      <div style={{ width: "80px", textAlign: "center", borderLeft: "1px solid #e0e0e0" }}>
        Início
      </div>
      <div style={{ width: "80px", textAlign: "center", borderLeft: "1px solid #e0e0e0" }}>
        Fim
      </div>
    </div>
  );
};

function ProjectMilestone({ projectId }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.Month); // Começa vendo por Mês
  const [isChecked, setIsChecked] = useState(true); // Mostrar lista ao lado

  // Estado para o formulário
  const [newMilestone, setNewMilestone] = useState({
    task: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = () => {
    api.get(`milestones/?project=${projectId}`)
      .then((res) => {
        setMilestones(res.data.results || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newMilestone.task || !newMilestone.start_date || !newMilestone.end_date) {
        alert("Preencha todos os campos!");
        return;
    }
    
    // Validação simples
    if (newMilestone.start_date > newMilestone.end_date) {
        alert("A data final deve ser depois da inicial.");
        return;
    }

    api.post("milestones/", {
      project: projectId,
      task: newMilestone.task,
      start_date: newMilestone.start_date,
      end_date: newMilestone.end_date,
      task_percentage_plan: 0,
      task_percentage_real: 0
    })
    .then((res) => {
      setMilestones([...milestones, res.data]);
      setNewMilestone({ task: "", start_date: "", end_date: "" });
    })
    .catch(() => alert("Erro ao criar marco."));
  };

  // --- TRANSFORMAÇÃO DE DADOS ---
  // A biblioteca exige um array de objetos com chaves específicas
  const ganttTasks = milestones.map(m => ({
    start: new Date(m.start_date + "T00:00:00"),
    end: new Date(m.end_date + "T23:59:59"), // Fim do dia
    name: m.task,
    id: String(m.id),
    type: 'task', // ou 'project' ou 'milestone'
    progress: Number(m.task_percentage_real) || 0,
    isDisabled: false,
    styles: { 
        progressColor: '#0d6efd', // Azul Bootstrap
        backgroundColor: '#cfe2ff', 
        progressSelectedColor: '#0a58ca'
    }
  }));

  // Função chamada quando o usuário ARRASTA a barra
  const handleTaskChange = (task) => {
    // 1. Atualiza visualmente na hora
    const newMilestones = milestones.map(m => {
        if (String(m.id) === task.id) {
            return {
                ...m,
                start_date: task.start.toISOString().split('T')[0],
                end_date: task.end.toISOString().split('T')[0]
            };
        }
        return m;
    });
    setMilestones(newMilestones);

    // 2. (Opcional) Aqui você faria o api.patch para salvar no banco
    console.log("Nova data salva:", task.start, task.end);
  };

  if (loading) return <div>Carregando Timeline...</div>;

  return (
    <div className="milestone-container">
      
      {/* HEADER: Formulário + Controles de Visualização */}
      <div className="milestone-controls">
          <form onSubmit={handleCreate} className="milestone-form-compact">
            <input
              type="text"
              placeholder="Novo Marco..."
              value={newMilestone.task}
              onChange={(e) => setNewMilestone({ ...newMilestone, task: e.target.value })}
              required
            />
            <input
              type="date"
              value={newMilestone.start_date}
              onChange={(e) => setNewMilestone({ ...newMilestone, start_date: e.target.value })}
              required
            />
            <input
              type="date"
              value={newMilestone.end_date}
              onChange={(e) => setNewMilestone({ ...newMilestone, end_date: e.target.value })}
              required
            />
            <button type="submit" className="btn-add-mini">+</button>
          </form>

          <div className="view-mode-selector">
              <button onClick={() => setViewMode(ViewMode.Day)} className={viewMode === ViewMode.Day ? 'active' : ''}>Dia</button>
              <button onClick={() => setViewMode(ViewMode.Week)} className={viewMode === ViewMode.Week ? 'active' : ''}>Semana</button>
              <button onClick={() => setViewMode(ViewMode.Month)} className={viewMode === ViewMode.Month ? 'active' : ''}>Mês</button>
          </div>
      </div>

      <div className="gantt-wrapper">
        {ganttTasks.length > 0 ? (
            <Gantt
                tasks={ganttTasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                listCellWidth={isChecked ? "155px" : ""}
                columnWidth={viewMode === ViewMode.Month ? 180 : 65}
                locale="pt-BR" 
                TaskListHeader={PortugueseHeader}
                barFill={60}
                fontFamily="Segoe UI, sans-serif"
                headerHeight={50}
                rowHeight={50}
            />
        ) : (
            <div className="empty-state">
                <p>Nenhum marco na linha do tempo.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default ProjectMilestone;