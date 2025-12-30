import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProjectStatusReport.css";

function ProjectStatusReport({ projectId }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Estado inicial do formulário com todos os campos novos
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    loadReports();
  }, [projectId]);

  const loadReports = () => {
    api.get(`reports/?project=${projectId}`)
       .then(res => setReports(res.data.results || res.data))
       .catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("reports/", { ...formData, project: projectId })
       .then(res => {
         setReports([res.data, ...reports]);
         setShowForm(false);
         // Resetar form (opcional)
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

  // Helper para renderizar os textos com quebra de linha
  const renderList = (text) => {
      if(!text) return null;
      return text.split('\n').map((line, i) => <div key={i}>• {line}</div>);
  };

  return (
    <div className="report-container">
      {!showForm && (
        <button className="btn-new-report" onClick={() => setShowForm(true)}>
          + Gerar Novo Reporte Executivo
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="report-form">
            <h2>Novo Status Report</h2>
            
            {/* BLOCO 1: VISÃO GERAL */}
            <div className="form-section">
                <h3>1. Visão Geral e Tendência</h3>
                <div className="status-grid">
                    <div>
                        <label>Status Anterior</label>
                        <select value={formData.previous_status} onChange={e => setFormData({...formData, previous_status: e.target.value})}>
                            <option value="OK">🟢 OK</option>
                            <option value="WARNING">🟡 Atenção</option>
                            <option value="CRITICAL">🔴 Risco</option>
                        </select>
                    </div>
                    <div className="arrow">➡️</div>
                    <div>
                        <label>Status Atual</label>
                        <select value={formData.current_status} onChange={e => setFormData({...formData, current_status: e.target.value})}>
                            <option value="OK">🟢 OK</option>
                            <option value="WARNING">🟡 Atenção</option>
                            <option value="CRITICAL">🔴 Risco</option>
                        </select>
                    </div>
                    <div>
                        <label>Tendência</label>
                        <select value={formData.trend} onChange={e => setFormData({...formData, trend: e.target.value})}>
                            <option value="IMPROVING">↗️ Melhorando</option>
                            <option value="STABLE">➡️ Estável</option>
                            <option value="WORSENING">↘️ Piorando</option>
                        </select>
                    </div>
                </div>
                <div style={{marginTop: '10px'}}>
                    <label>Justificativa da Tendência:</label>
                    <input 
                        type="text" 
                        placeholder="Ex: A equipe recuperou o atraso..."
                        value={formData.trend_description}
                        onChange={e => setFormData({...formData, trend_description: e.target.value})}
                        required
                    />
                </div>
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
      )}

      {/* TIMELINE DE REPORTES */}
      <div className="reports-list">
          {reports.map(report => (
              <div key={report.id} className={`report-card border-${report.current_status}`}>
                  <div className="card-header-report">
                      <span className="report-date">{new Date(report.created_at).toLocaleDateString()}</span>
                      <div className="status-badges">
                          <span className={`badge badge-${report.previous_status} opacity-50`}>{report.previous_status}</span>
                          <span>➜</span>
                          <span className={`badge badge-${report.current_status}`}>{report.current_status}</span>
                          <span className="trend-icon">
                              {report.trend === 'IMPROVING' ? '↗️ Melhorando' : report.trend === 'WORSENING' ? '↘️ Piorando' : '➡️ Estável'}
                          </span>
                      </div>
                  </div>

                  <div className="trend-desc">
                      <strong>Tendência:</strong> {report.trend_description}
                  </div>

                  <div className="card-grid">
                      <div className="card-section">
                          <h4>Em Andamento</h4>
                          {renderList(report.ongoing_activities)}
                      </div>
                      <div className="card-section">
                          <h4>Próximos Passos</h4>
                          {renderList(report.next_activities)}
                      </div>
                      <div className="card-section bg-light-yellow">
                          <h4>Pontos de Atenção</h4>
                          {renderList(report.attention_points)}
                      </div>
                      <div className="card-section">
                          <h4>Pendências</h4>
                          {renderList(report.pending_activities)}
                      </div>
                  </div>
                  
                  {report.observations && (
                      <div className="card-obs">
                          <strong>Obs:</strong> {report.observations}
                      </div>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
}

export default ProjectStatusReport;