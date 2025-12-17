import { useEffect, useState } from "react";
import api from "../services/api";
import "./RisksList.css"; // Vamos criar jajá

function RiskList({ projectId }) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRisk, setNewRisk] = useState({
    description: "",
    category: "TEC",         // Valor padrão: Técnico
    action: "MITIGAR",       // Valor padrão: Mitigar
    cost: "0.10",            // String, conforme CharField do model
    timeline: "0.10",
    scope: "0.10",
    quality: "0.10",
    probability: "0.10",
    mitigation_plan: ""      // Será mapeado para action_plan
  });

  // 1. Carregar Riscos
  useEffect(() => {
    fetchRisks();
  }, [projectId]);

  const fetchRisks = () => {
    api.get(`risks/?project=${projectId}`)
      .then(response => {
        // Blindagem contra Paginação (igual fizemos no Canvas)
        const lista = response.data.results ? response.data.results : response.data;
        setRisks(lista);
        setLoading(false);
      })
      .catch(error => console.error("Erro ao buscar riscos:", error));
  };

  // 2. Criar Risco
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dados = {
        project: projectId,
        description: newRisk.description,
        category: newRisk.category,
        action_plan: newRisk.mitigation_plan, 
        cost: newRisk.cost,
        timeline: newRisk.timeline,
        scope: newRisk.scope,
        quality: newRisk.quality,
        probability: newRisk.probability,
        action: newRisk.action,
        status: "INICIAR"
    };

    api.post('risks/', dados)
      .then(response => {
        setRisks([...risks, response.data]);
        
        // Limpa o formulário
        setNewRisk({ 
            description: "", 
            category: "TEC", 
            action: "MITIGAR",
            cost: "0.10", timeline: "0.10", scope: "0.10", quality: "0.10", probability: "0.10", 
            mitigation_plan: "" 
        });
        alert("Risco adicionado!");
      })
      .catch(error => {
          console.error(error);
          const msg = error.response?.data ? JSON.stringify(error.response.data) : "Erro desconhecido";
          alert("Erro ao criar: " + msg);
      });
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este risco?")) {
      api.delete(`risks/${id}/`)
        .then(() => {
          setRisks(risks.filter(risk => risk.id !== id));
        })
        .catch(error => alert("Erro ao excluir."));
    }
  };

  return (
    <div className="risk-container">
    
        <div className="risk-form-box">
        <h3>🚨 Adicionar Novo Risco</h3>

        <form onSubmit={handleSubmit} className="form-grid">
            
            {/* CABEÇALHOS */}
            <label>Descrição</label>
            <label>Categoria</label>
            <label>Ação</label>
            <label>Custo</label>
            <label>Tempo</label>
            <label>Escopo</label>
            <label>Qualid.</label>
            <label>Prob.</label>
            <label>Plano</label>
            <span></span> 

            {/* INPUT DESCRIÇÃO */}
            <input 
                type="text" 
                value={newRisk.description}
                onChange={e => setNewRisk({...newRisk, description: e.target.value})}
                required
            />

            {/* SELECT CATEGORIA (Values = Chaves do Model) */}
            <select value={newRisk.category} onChange={e => setNewRisk({...newRisk, category: e.target.value})}>
                <option value="TEC">Técnico</option>
                <option value="EXT">Externo</option>
                <option value="ORG">Organizacional</option>
                <option value="GP">Gestão de Proj.</option>
            </select>

            {/* SELECT AÇÃO (Values = Chaves do Model) */}
            <select value={newRisk.action} onChange={e => setNewRisk({...newRisk, action: e.target.value})}>
                <option value="MITIGAR">Mitigar</option>
                <option value="ACEITAR">Aceitar</option>
                <option value="TRANSFERIR">Transferir</option>
                <option value="ELIMINAR">Eliminar</option>
            </select>

            {/* SELECTS DE VALORES (Strings 0.10...) */}
            <select value={newRisk.cost} onChange={e => setNewRisk({...newRisk, cost: e.target.value})}>
                <option value="0.10">M. Baixo (0.1)</option>
                <option value="0.30">Baixo (0.3)</option>
                <option value="0.50">Médio (0.5)</option>
                <option value="0.70">Alto (0.7)</option>
                <option value="0.90">M. Alto (0.9)</option>
            </select>

            <select value={newRisk.timeline} onChange={e => setNewRisk({...newRisk, timeline: e.target.value})}>
                <option value="0.10">M. Baixo</option>
                <option value="0.30">Baixo</option>
                <option value="0.50">Médio</option>
                <option value="0.70">Alto</option>
                <option value="0.90">M. Alto</option>
            </select>

            <select value={newRisk.scope} onChange={e => setNewRisk({...newRisk, scope: e.target.value})}>
                <option value="0.10">M. Baixo</option>
                <option value="0.30">Baixo</option>
                <option value="0.50">Médio</option>
                <option value="0.70">Alto</option>
                <option value="0.90">M. Alto</option>
            </select>

            <select value={newRisk.quality} onChange={e => setNewRisk({...newRisk, quality: e.target.value})}>
                <option value="0.10">M. Baixo</option>
                <option value="0.30">Baixo</option>
                <option value="0.50">Médio</option>
                <option value="0.70">Alto</option>
                <option value="0.90">M. Alto</option>
            </select>
            
            <select value={newRisk.probability} onChange={e => setNewRisk({...newRisk, probability: e.target.value})}>
                <option value="0.10">M. Baixa</option>
                <option value="0.30">Baixa</option>
                <option value="0.50">Média</option>
                <option value="0.70">Alta</option>
                <option value="0.90">M. Alta</option>
            </select>

            {/* PLANO DE AÇÃO (Mapeado para action_plan) */}
            <input 
                type="text" 
                value={newRisk.mitigation_plan}
                onChange={e => setNewRisk({...newRisk, mitigation_plan: e.target.value})}
                placeholder="Plano..."
            />

            <button type="submit" className="btn-add">+</button>
        </form>
        </div>

      {/* TABELA DE RESULTADOS */}
      <table className="risk-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Score</th>
            <th>Ação</th>
            <th>Plano de Ação</th>
            <th>Responsável</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {risks.map(risk => {
            const score = parseFloat(risk.score || 0); 
            
            let nivelClass = "low";
            if (score >= 0.45) nivelClass = "high";
            else if (score >= 0.20) nivelClass = "medium";

            return (
              <tr key={risk.id}>
                <td>{risk.description}</td>
                <td>{risk.category}</td>
                <span className={`risk-badge ${nivelClass}`}>
                  {score.toFixed(2)}
                </span>
                <td>{risk.action}</td>
                <td>{risk.action_plan}</td>
                <td>{risk.response}</td>
                <td>{risk.status}</td>
                <td>
                  <button className="btn-delete" onClick={() => handleDelete(risk.id)}>🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RiskList;