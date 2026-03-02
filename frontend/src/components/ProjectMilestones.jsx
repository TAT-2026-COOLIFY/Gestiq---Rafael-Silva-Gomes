import { useEffect, useState } from "react";
// Importa a biblioteca nova e os tipos
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css"; // <--- IMPORTANTE: O CSS PADRÃO
import api from "../services/api";
import "./ProjectMilestones.css";

const formatDate = (date) => {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

// Componente personalizado para as linhas da tabela
const PortugueseTaskList = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick, // Necessário se você tiver sub-tarefas no futuro
}) => {
  return (
    <div style={{ fontFamily: fontFamily, fontSize: fontSize }}>
      {tasks.map((t) => (
        <div
          key={t.id}
          style={{
            height: rowHeight,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            borderBottom: "1px solid #e0e0e0", // Linha divisória suave
            backgroundColor: "#fff",
          }}
        >
          {/* Coluna Nome da Tarefa */}
          <div
            style={{
              flex: 1,
              paddingLeft: "15px",
              minWidth: rowWidth,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={t.name}
          >
            {t.name}
          </div>

          {/* Coluna Data Início (Formatada) */}
          <div
            style={{
              width: "80px", // Mesma largura do Header
              textAlign: "center",
              borderLeft: "1px solid #e0e0e0",
            }}
          >
            {formatDate(t.start)}
          </div>

          {/* Coluna Data Fim (Formatada) */}
          <div
            style={{
              width: "80px", // Mesma largura do Header
              textAlign: "center",
              borderLeft: "1px solid #e0e0e0",
            }}
          >
            {formatDate(t.end)}
          </div>
        </div>
      ))}
    </div>
  );
};

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
    // 1. Formatar as datas para o padrão do banco (YYYY-MM-DD)
    // A biblioteca devolve objetos Date completos, precisamos limpar.
    const newStartDate = task.start.toISOString().split('T')[0];
    const newEndDate = task.end.toISOString().split('T')[0];

    console.log("Enviando para o banco:", newStartDate, newEndDate);

    // 2. Atualiza visualmente na hora (Otimista)
    const newMilestones = milestones.map(m => {
        if (String(m.id) === task.id) {
            return {
                ...m,
                start_date: newStartDate,
                end_date: newEndDate
            };
        }
        return m;
    });
    setMilestones(newMilestones);

    // 3. Salva no Banco de Dados via API
    api.patch(`milestones/${task.id}/`, {
      start_date: newStartDate,
      end_date: newEndDate
    })
    .then((res) => {
      console.log("Salvo com sucesso!", res.data);
    })
    .catch((err) => {
      console.error("Erro ao salvar a alteração:", err);
      alert("Erro ao salvar a nova data no sistema.");
      // Opcional: Aqui você poderia reverter o setMilestones se der erro
      fetchMilestones(); 
    });
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
                TaskListTable={PortugueseTaskList}
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