import { useEffect, useState } from "react";
import api from "@/services/api";
import styles from "./ProjectScrum.module.css";
import { Loading } from "@/components/Loading/Loading";
import { 
  ListTodo, 
  CheckCircle2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export function ProjectScrum({ projectId }) {
  console.log("ID do Projeto no ScrumBoard:", projectId);
  const [tasks, setTasks] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState("");

  useEffect(() => {
    if (!projectId) return;

    async function loadScrumData() {
      try {
        const [tasksRes, sprintsRes] = await Promise.all([
          api.get(`activities/?project=${projectId}`),
          api.get(`sprints/?project=${projectId}`)
        ]);

        const activitiesData = tasksRes.data?.results || tasksRes.data;
        const sprintsData = sprintsRes.data?.results || sprintsRes.data;

        setTasks(activitiesData);
        const activeSprint = sprintsData.find(s => s.status !== "FINISHED");
        setCurrentSprint(activeSprint || null);

      } catch (err) {
        console.error("Erro ao carregar dados do Scrum:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadScrumData();
  }, [projectId]);

  const toggleSelection = (taskId) => {
    setSelectedTaskIds((prev) => 
      prev.includes(taskId) 
        ? prev.filter((id) => id !== taskId) 
        : [...prev, taskId]
    );
  };

  const handleBulkMove = async (targetSprintId) => {
    if (targetSprintId !== null && !currentSprint) {
      alert("Você não tem nenhuma Sprint ativa ou planejada. Crie uma primeiro!");
      return;
    }

    setActionStatus("Movendo...");

    try {
      await Promise.all(
        selectedTaskIds.map(id => 
          api.patch(`activities/${id}/`, { sprint: targetSprintId })
        )
      );

      setTasks(prev => prev.map(task => 
        selectedTaskIds.includes(task.id) ? { ...task, sprint: targetSprintId } : task
      ));
      
      setSelectedTaskIds([]);
      setActionStatus("Sucesso");
      setTimeout(() => setActionStatus(""), 3000);

    } catch (err) {
      console.error("Erro ao mover tarefas:", err);
      setActionStatus("Erro");
      setTimeout(() => setActionStatus(""), 3000);
    }
  };

  if (loading) return <Loading />;

  const backlogTasks = tasks.filter(task => task.sprint === null);
  const sprintTasks = tasks.filter(task => task.sprint !== null);

  const isMovingToSprint = tasks.some(t => selectedTaskIds.includes(t.id) && t.sprint === null);
  const isMovingToBacklog = tasks.some(t => selectedTaskIds.includes(t.id) && t.sprint !== null);

  const statusClass = actionStatus === "Movendo..." ? "salvando" 
                    : actionStatus === "Sucesso" ? "salvo" 
                    : actionStatus === "Erro" ? "erro" : "";

  return (
    <div className={styles.container}>
      
      <div className={styles.boardVertical}>
        
        {/* SEÇÃO 1: SPRINT ATUAL (No topo, estilo Jira) */}
        <div className={styles.section}>
          <div className={`${styles.sectionHeader} ${styles.blueHeader}`}>
            <div className={styles.headerTitle}>
              <CheckCircle2 size={20} />
              <h3>{currentSprint ? currentSprint.name : "Nenhuma Sprint Ativa"}</h3>
              <span className={styles.badge}>{sprintTasks.length}</span>
            </div>
            {!currentSprint && (
              <button className={styles.newSprintBtn}>+ Nova Sprint</button>
            )}
          </div>

          <div className={styles.taskList}>
            {sprintTasks.length === 0 ? (
              <p className={styles.emptyText}>
                {currentSprint ? "Arraste ou envie tarefas do Backlog para iniciar a Sprint." : "Crie uma Sprint para começar."}
              </p>
            ) : (
              sprintTasks.map(task => (
                <TaskInline 
                  key={task.id} 
                  task={task} 
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggle={() => toggleSelection(task.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* SEÇÃO 2: BACKLOG (Embaixo, estilo Jira) */}
        <div className={styles.section}>
          <div className={`${styles.sectionHeader} ${styles.grayHeader}`}>
             <div className={styles.headerTitle}>
              <ListTodo size={20} />
              <h3>Backlog</h3>
              <span className={styles.badge}>{backlogTasks.length}</span>
            </div>
            <button className={styles.createTaskBtn}>+ Criar Tarefa</button>
          </div>
          
          <div className={styles.taskList}>
            {backlogTasks.length === 0 ? (
              <p className={styles.emptyText}>Nenhuma tarefa no Backlog. O projeto está zerado!</p>
            ) : (
              backlogTasks.map(task => (
                <TaskInline 
                  key={task.id} 
                  task={task} 
                  isSelected={selectedTaskIds.includes(task.id)}
                  onToggle={() => toggleSelection(task.id)}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* BARRA FLUTUANTE (Mantida igual) */}
      {(selectedTaskIds.length > 0 || actionStatus) && (
        <div className={styles.actions}>
          <div className={`${styles.saveIndicator} ${styles[statusClass]}`}>
            
            {actionStatus === "Movendo..." && <Loader2 size={18} className={styles.spin} />}
            {actionStatus === "Sucesso" && <CheckCircle2 size={18} />}
            {actionStatus === "Erro" && <AlertCircle size={18} />}
            {actionStatus && <span style={{ marginRight: '15px' }}>{actionStatus}</span>}

            {selectedTaskIds.length > 0 && !actionStatus && (
              <>
                <span className={styles.selectionCount}>
                  {selectedTaskIds.length} selecionada(s)
                </span>

                {/* Ícones alterados para Cima/Baixo para combinar com o layout vertical */}
                {isMovingToBacklog && (
                  <button onClick={() => handleBulkMove(null)} className={styles.actionBtn}>
                    <ArrowDownCircle size={18} />
                    Remover da Sprint
                  </button>
                )}

                {isMovingToSprint && (
                  <button onClick={() => handleBulkMove(currentSprint?.id)} className={`${styles.actionBtn} ${styles.btnPrimary}`}>
                    <ArrowUpCircle size={18} />
                    Subir para Sprint
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente refatorado para ser uma linha (Inline) estilo Jira
function TaskInline({ task, isSelected, onToggle }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': case 'CRITICAL': return styles.tagRed;
      case 'MEDIUM': return styles.tagYellow;
      default: return styles.tagGreen;
    }
  };

  return (
    <div 
      className={`${styles.taskInline} ${isSelected ? styles.selected : ""}`} 
      onClick={onToggle}
    >
      <div className={styles.taskMain}>
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => {}} 
          className={styles.checkbox}
        />
        {/* Usamos o ID ou um prefixo simulando a issue key do Jira (ex: TCC-14) */}
        <span className={styles.taskKey}>TASK-{task.id}</span>
        <span className={styles.taskTitle}>{task.title}</span>
      </div>

      <div className={styles.taskMeta}>
        <span className={`${styles.priorityTag} ${getPriorityColor(task.priority)}`}>
          {task.priority || "MEDIUM"}
        </span>
        {task.assigned_to_username ? (
          <div className={styles.assigneeAvatar} title={task.assigned_to_username}>
            {task.assigned_to_username.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className={styles.assigneeUnassigned} title="Não atribuído">?</div>
        )}
      </div>
    </div>
  );
}