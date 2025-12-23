import { useEffect, useState } from "react";
import api from "../services/api";
import EditTaskModal from "./EditKanbanModal";
import "./ProjectKanban.css";

function ProjectKanban({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]); // <--- NOVO: Lista de membros
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);

  const STATUS_FLOW = ["BACKLOG", "PLAN", "DOING", "DONE"];
  
  const STATUS_LABELS = {
    "BACKLOG": "Backlog (Ideias)",
    "PLAN": "A Fazer",
    "DOING": "Em Andamento",
    "DONE": "Concluído"
  };

  // <--- NOVO: assigned_to no estado inicial
  const [newTask, setNewTask] = useState({ 
    title: "", 
    priority: "MEDIUM",
    assigned_to: "" 
  });

  useEffect(() => {
    // Agora buscamos Tarefas E Membros ao mesmo tempo
    Promise.all([
        api.get(`activities/?project=${projectId}`),
        api.get(`members/?project=${projectId}`)
    ]).then(([resTasks, resMembers]) => {
        setTasks(resTasks.data.results || resTasks.data);
        setMembers(resMembers.data.results || resMembers.data); // <--- Guarda os membros
        setLoading(false);
    }).catch(err => {
        console.error("Erro ao carregar Kanban:", err);
        setLoading(false);
    });
  }, [projectId]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    api.post("activities/", {
      project: projectId,
      title: newTask.title,
      priority: newTask.priority,
      status: "BACKLOG",
      // <--- NOVO: Envia o ID do usuário (se tiver selecionado) ou null
      assigned_to: newTask.assigned_to || null 
    })
    .then(res => {
        setTasks([...tasks, res.data]);
        // Limpa o formulário
        setNewTask({ title: "", priority: "MEDIUM", assigned_to: "" });
    })
    .catch(err => alert("Erro ao criar tarefa."));
  };

  const handleMove = (task, direction) => {
    const currentIndex = STATUS_FLOW.indexOf(task.status);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= STATUS_FLOW.length) return;

    const newStatus = STATUS_FLOW[newIndex];

    api.patch(`activities/${task.id}/`, { status: newStatus })
      .then(res => {
         const updatedTasks = tasks.map(t => 
            t.id === task.id ? { ...t, status: newStatus } : t
         );
         setTasks(updatedTasks);
      })
      .catch(() => alert("Erro ao mover tarefa."));
  };

  const handleDelete = (id) => {
      if(confirm("Excluir tarefa?")) {
          api.delete(`activities/${id}/`).then(() => {
              setTasks(tasks.filter(t => t.id !== id));
          });
      }
  }

  const handleSaveFromModal = (taskId, updatedData) => {
      api.patch(`activities/${taskId}/`, updatedData)
        .then(res => {
            const updatedTasks = tasks.map(t => 
                t.id === taskId ? res.data : t
            );
            setTasks(updatedTasks);
            setEditingTask(null);
        })
        .catch(err => alert("Erro ao atualizar tarefa."));
  };

  const getTasksByColumn = (statusKey) => {
      return tasks.filter(t => t.status === statusKey);
  }

  // Helper para pegar a foto do usuário na lista de membros (opcional, para visualização rápida)
  const getMemberPhoto = (username) => {
      const member = members.find(m => m.username === username);
      if (member && member.photo) return member.photo;
      return null;
  }

  if (loading) return <div>Carregando Kanban...</div>;

  const getFullImageUrl = (path) => {
      if (!path) return null;
      
      if (path.startsWith('http')) return path;

      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      
      return `${baseUrl}${path}`;
  };

  return (
    <div className="kanban-container">
      
      {/* --- FORMULÁRIO COM SELEÇÃO DE MEMBRO --- */}
      <form onSubmit={handleCreate} className="quick-add-form">
          <input 
            id="title"
            name="title"
            type="text" 
            placeholder="Nova tarefa..." 
            value={newTask.title}
            onChange={e => setNewTask({...newTask, title: e.target.value})}
            required
          />
          
          {/* SELETOR DE PRIORIDADE */}
          <select 
            id="priority"
            name="priority"
            value={newTask.priority} 
            onChange={e => setNewTask({...newTask, priority: e.target.value})}
            style={{maxWidth: '100px'}}
          >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
          </select>

          {/* NOVO: SELETOR DE RESPONSÁVEL */}
          <select 
            id="assigned"
            name="assigned"
            value={newTask.assigned_to} 
            onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
            style={{maxWidth: '150px'}}
          >
              <option value="">Sem dono...</option>
              {members.map(member => (
                  // Atenção: O value deve ser member.user (o ID do Usuário), não member.id
                  <option key={member.id} value={member.user}>
                      {member.nome_completo || member.username}
                  </option>
              ))}
          </select>

          <button type="submit" className="btn-add" style={{width: 'auto'}}>Add</button>
      </form>

      {/* BOARD */}
      <div className="kanban-board">
        {STATUS_FLOW.map((statusKey, index) => (
            <div key={statusKey} className="kanban-column">
                <h3>{STATUS_LABELS[statusKey]} ({getTasksByColumn(statusKey).length})</h3>
                
                {getTasksByColumn(statusKey).map(task => {
                    // Pega a URL da foto vinda da Tarefa (se o backend mandou)
                    // Ou tenta achar na lista de membros
                    const photoUrl = task.assigned_to_photo || getMemberPhoto(task.assigned_to_username);

                    return (
                    <div key={task.id} className={`kanban-card priority-${task.priority}`}onClick={() => setEditingTask(task)} style={{cursor: 'pointer'}} 
                    >
                        <span className="card-title">{task.title}</span>
                        
                        <div className="card-footer">
                            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                {/* Lógica do Avatar: Foto ou Inicial */}
                                {photoUrl ? (
                                    <img 
                                        src={getFullImageUrl(photoUrl)}
                                        alt="User" 
                                        className="card-avatar" 
                                        style={{objectFit:'cover'}} 
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span className="card-avatar">
                                        {task.assigned_to_username 
                                            ? task.assigned_to_username[0].toUpperCase() 
                                            : "?"}
                                    </span>
                                )}
                                
                                <span style={{fontSize:'0.7rem'}}>
                                    {task.assigned_to_username || "Ninguém"}
                                </span>
                            </div>

                            <button onClick={() => handleDelete(task.id)} style={{border:'none', background:'transparent', cursor:'pointer', color:'#aaa'}}>x</button>
                        </div>

                        <div className="card-actions">
                            {index > 0 ? (
                                <button className="btn-move" onClick={() => handleMove(task, -1)}>⬅️</button>
                            ) : <span></span>}

                            {index < STATUS_FLOW.length - 1 ? (
                                <button className="btn-move" onClick={() => handleMove(task, 1)}>➡️</button>
                            ) : <span></span>}
                        </div>
                    </div>
                )})}
            </div>
        ))}
      </div>
      {editingTask && (
          <EditTaskModal 
              task={editingTask}
              members={members}
              onClose={() => setEditingTask(null)}
              onSave={handleSaveFromModal}
          />
      )}
    </div>
  );
}

export default ProjectKanban;