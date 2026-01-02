import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProjectStatusReport.css";

function ProjectStatusReport({ projectId }) {
  const [reports, setReports] = useState([]);

  // Estado inicial do formulário com todos os campos novos
  const [formData, setFormData] = useState({
    previous_status: "OK",
    current_status: "OK",
    trend: "STABLE",
    trend_description: "",
    observations: "",
    ongoing_activities: [],
    next_activities: [],
    pending_activities: [],
    attention_points: [],
  });

  useEffect(() => {
    loadReports();
  }, [projectId]);

  const loadReports = () => {
    api.get(`reports/?project=${projectId}`)
       .then(res => {
        const data = res.data.results ? res.data.results[0] : res.data;

        setFormData({
            ...data,
            ongoing_activities: data.ongoing_activities ? data.ongoing_activities.split('\n') : [],
            next_activities: data.next_activities ? data.next_activities.split('\n') : [],
            pending_activities: data.pending_activities ? data.pending_activities.split('\n') : [],
            attention_points: data.attention_points ? data.attention_points.split('\n') : [],
        });
       })
       .catch(console.error);
  };

  const handleChangeItem = (id, newValue, taskName) => {
        setFormData(totalList => {
            const listaAtualizada = [...totalList[taskName]];
            
            listaAtualizada[id] = newValue;

            return {
                ...totalList,
                [taskName]: listaAtualizada
            };
        });
    }

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("reports/", { ...formData, project: projectId })
       .then(res => {
         setReports([res.data, ...reports]);
         setShowForm(false);
         setFormData({
            previous_status: "OK",
            current_status: "OK",
            trend: "STABLE",
            trend_description: "",
            ongoing_activities: "",
            next_activities: "",
            pending_activities: "",
            attention_points: "",
            observations: ""
         });
       })
       .catch(err => alert("Erro ao salvar reporte."));
  };

  const handleAddItem = (taskName) => {
    setFormData(totalList => {
        return {
            ...totalList,
            [taskName]: [
                ...totalList[taskName],
                ""
            ]
        }
    })
  }

  return (
    <div className="report-container">
        <form onSubmit={handleSubmit} className="report-form">
            <h3>Atividades em Andamento</h3>
            
            <div className="form-section">
                {formData.ongoing_activities.map((item, id) => (
                    <div key={id} style={{ display: 'flex', marginBottom: '5px' }}>
                        
                        {/* O Input da Tarefa */}
                        <input 
                            type="text"
                            value={item} 
                            onChange={(e) => handleChangeItem(id, e.target.value, 'ongoing_activities')}
                        />

                        {/* O Botão de Remover */}
                        <button type="button" onClick={() => handleRemoveItem(id, 'ongoing_activities')}>
                            X
                        </button>
                    </div>
                ))}

                {/* Botão de Adicionar Nova Linha */}
                <button type="button" onClick={() => handleAddItem('ongoing_activities')}>
                    + Adicionar Atividade
                </button>
            </div>

            {/* BLOCO 2: DETALHES (TEXTAREAS) */}
            <div className="form-grid-2">
                <div>
                    <label>🚀 Atividades em Andamento</label>
                    <textarea rows="4" value={formData.ongoing_activities} onChange={e => setFormData({...formData, ongoing_activities: e.target.value})} placeholder="- Item 1&#10;- Item 2"></textarea>
                </div>
                <div>
                    <label>📅 Próximas Atividades</label>
                    <textarea rows="4" value={formData.next_activities} onChange={e => setFormData({...formData, next_activities: e.target.value})}></textarea>
                </div>
                <div>
                    <label>⚠️ Pontos de Atenção</label>
                    <textarea rows="4" className="bg-warning" value={formData.attention_points} onChange={e => setFormData({...formData, attention_points: e.target.value})}></textarea>
                </div>
                <div>
                    <label>⏳ Pendências (Impedimentos)</label>
                    <textarea rows="4" value={formData.pending_activities} onChange={e => setFormData({...formData, pending_activities: e.target.value})}></textarea>
                </div>
            </div>

            <div style={{marginTop: '15px'}}>
                <label>📝 Observações Gerais</label>
                <textarea rows="2" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})}></textarea>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-save">Publicar Reporte</button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
        </form>
    </div>
  );
}

export default ProjectStatusReport;