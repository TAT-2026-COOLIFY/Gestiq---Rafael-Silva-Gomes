import { useEffect, useState } from "react";
import api from "../services/api";
import "./RisksList.css"; // Vamos criar jajá

function RiskList({ projectId }) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRisk, setNewRisk] = useState({
    description: "",
    cost: "0.10",
    timeline: "0.10",
    scope: "0.10",
    quality: "0.10",
    probability: "0.10", // 1 (Baixa) a 5 (Alta)
    impact: "0.10",      // 1 (Baixo) a 5 (Alto)
    mitigation_plan: ""
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
        description: newRisk.description,
        mitigation_plan: newRisk.mitigation_plan,
        project: projectId,
        cost: parseFloat(newRisk.cost),
        timeline: parseFloat(newRisk.timeline),
        scope: parseFloat(newRisk.scope),
        quality: parseFloat(newRisk.quality),
        probability: parseFloat(newRisk.probability),
        impact: parseFloat(newRisk.impact)
    };

    api.post('risks/', dados)
      .then(response => {
        setRisks([...risks, response.data]);
        
        // Limpa o formulário
        setNewRisk({ description: "", cost: "0.10", timeline: "0.10", scope: "0.10", quality: "0.10", probability: "0.10", mitigation_plan: "" });
        alert("Risco adicionado!");
      })
      .catch(error => alert("Erro ao criar risco."));
  };

  // 3. Excluir Risco
  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este risco?")) {
      api.delete(`risks/${id}/`)
        .then(() => {
          // Remove da lista visualmente (Filtra todos menos o que foi excluido)
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
            
            {/* CABEÇALHOS - Removi o "Impacto" */}
            <label>Descrição</label>
            <label>Custo</label>
            <label>Tempo</label>
            <label>Escopo</label>
            <label>Qualid.</label>
            <label>Prob.</label>
            <label>Plano</label>
            <span></span> 

            {/* INPUTS */}
            <input 
                type="text" 
                value={newRisk.description}
                onChange={e => setNewRisk({...newRisk, description: e.target.value})}
                required
            />

            {/* CUSTO */}
            <select value={newRisk.cost} onChange={e => setNewRisk({...newRisk, cost: e.target.value})}>
                <option value="0.10">Muito Baixa</option>
                <option value="0.30">Baixa</option>
                <option value="0.50">Média</option>
                <option value="0.70">Alta</option>
                <option value="0.90">Muito Alta</option>
            </select>

            {/* CRONOGRAMA */}
            <select value={newRisk.timeline} onChange={e => setNewRisk({...newRisk, timeline: e.target.value})}>
                <option value="0.10">Muito Baixa</option>
                <option value="0.30">Baixa</option>
                <option value="0.50">Média</option>
                <option value="0.70">Alta</option>
                <option value="0.90">Muito Alta</option>
            </select>

            {/* ESCOPO */}
            <select value={newRisk.scope} onChange={e => setNewRisk({...newRisk, scope: e.target.value})}>
                <option value="0.10">Muito Baixa</option>
                <option value="0.30">Baixa</option>
                <option value="0.50">Média</option>
                <option value="0.70">Alta</option>
                <option value="0.90">Muito Alta</option>
            </select>

            {/* QUALIDADE */}
            <select value={newRisk.quality} onChange={e => setNewRisk({...newRisk, quality: e.target.value})}>
                <option value="0.10">Muito Baixa</option>
                <option value="0.30">Baixa</option>
                <option value="0.50">Média</option>
                <option value="0.70">Alta</option>
                <option value="0.90">Muito Alta</option>
            </select>
            
            {/* PROBABILIDADE */}
            <select value={newRisk.probability} onChange={e => setNewRisk({...newRisk, probability: e.target.value})}>
                <option value="0.10">Muito Baixa</option>
                <option value="0.30">Baixa</option>
                <option value="0.50">Média</option>
                <option value="0.70">Alta</option>
                <option value="0.90">Muito Alta</option>
            </select>

            {/* AQUI NÃO TEM MAIS O SELECT DE IMPACTO */}

            <input 
                type="text" 
                value={newRisk.mitigation_plan}
                onChange={e => setNewRisk({...newRisk, mitigation_plan: e.target.value})}
            />

            <button type="submit" className="btn-add">+</button>
        </form>
    </div>

      <table className="risk-table">
        <thead>
            <tr>
                <th>Descrição</th>
                <th>Custo</th>
                <th>Tempo</th>
                <th>Prob.</th>
                <th>Score Final</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
          {risks.map(risk => {
            // O Score já vem calculado do banco
            const score = parseFloat(risk.score || 0); 

            let nivelClass = "low";
            if (score >= 0.45) nivelClass = "high";
            else if (score >= 0.21) nivelClass = "medium";

            return (
              <tr key={risk.id}>
                <td>{risk.description}</td>
                {/* Mostramos os fatores individuais se quiser */}
                <td>{risk.cost}</td>
                <td>{risk.timeline}</td>
                <td>{risk.probability}</td>
                <td>
                  <span className={`risk-badge ${nivelClass}`}>
                    {score.toFixed(2)} {/* Mostra 2 casas decimais */}
                  </span>
                </td>
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