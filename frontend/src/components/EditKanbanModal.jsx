import { useState, useEffect } from "react";
import "./EditKanbanModal.css";

function EditTaskModal({ task, members, onClose, onSave }) {
    // Estado local DO MODAL (só ele precisa saber o que está sendo digitado)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        end_date: "",
        priority: "MEDIUM",
        assigned_to: ""
    });

    // Quando o modal abre (ou a task muda), preenche o formulário
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || "",
                description: task.description || "",
                end_date: task.end_date || "",
                priority: task.priority || "MEDIUM",
                assigned_to: task.assigned_to || ""
            });
        }
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Manda os dados de volta para o Pai (Kanban) salvar
        onSave(task.id, formData);
    };

    if (!task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>📝 Editar Tarefa</h3>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <label>Título</label>
                    <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />

                    <label>Descrição Detalhada</label>
                    <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Descreva o que precisa ser feito..."
                    />

                    <div style={{display:'flex', gap:'15px'}}>
                        <div style={{flex:1}}>
                            <label>Prioridade</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                                <option value="CRITICAL">Crítica</option>
                            </select>
                        </div>
                        <div style={{flex:1}}>
                            <label>Prazo (Deadline)</label>
                            <input 
                                type="date"
                                value={formData.end_date}
                                onChange={e => setFormData({...formData, end_date: e.target.value})}
                            />
                        </div>
                    </div>

                    <label>Responsável</label>
                    <select 
                        value={formData.assigned_to}
                        onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                    >
                        <option value="">-- Sem responsável --</option>
                        {members.map(member => (
                            <option key={member.id} value={member.user}>
                                {member.nome_completo || member.username} ({member.function})
                            </option>
                        ))}
                    </select>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} style={{background:'#ccc', border:'none', padding:'10px', borderRadius:'4px', cursor:'pointer'}}>Cancelar</button>
                        <button type="submit" className="btn-save-modal">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTaskModal;