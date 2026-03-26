import { useEffect, useState } from "react";
import api from "@/services/api";
import styles from "./ProjectCanvas.module.css"

export function ProjectCanvas({ projectId }) {
    const [canvasId, setCanvasId] = useState(null)
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        benefits: "",
        product: "",
        requirements: "",
        stakeholders: "",
        team: "",
        systems: "",
        assumptions: "",
        deliverables: "",
        constraints: "",
        risks: "",
        timeline: "",
        costs: ""
    });

    useEffect(() => {
        api.get(`canvas/?project=${projectId}`)
        .then(response => {
            const listaDeCanvas = response.data.results ? response.data.results : response.data;

            if (listaDeCanvas.length > 0) {
            const canvasExistente = listaDeCanvas[0];
            
            setCanvasId(canvasExistente.id);
            setFormData(canvasExistente);
            }
            setLoading(false);
        })
        .catch(error => {
            console.error("Erro ao buscar Canvas:", error);
            setLoading(false);
        });
    }, [projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        const dadosParaEnviar = {
            ...formData,
            project: projectId
        };

        if (canvasId) {
            api.patch(`canvas/${canvasId}/`, dadosParaEnviar)
                .then(() => alert("Canvas atualizado com sucesso!"))
                .catch(err => alert("Erro ao atualizar."));
            } else {
            api.post("canvas/", dadosParaEnviar)
                .then((response) => {
                    alert("Canvas criado com sucesso!");
                    setCanvasId(response.data.id); 
                })
                .catch(err => alert("Erro ao criar."));
            }
        };

        if (loading) return <p>Carregando Canvas...</p>;

        return (
        <div className="canvas-container">
      {/* Vamos usar um Grid CSS para imitar o desenho do Canvas */}
      
      <div className="canvas-box benefits">
        <h3>Benefícios</h3>
        <textarea name="benefits" value={formData.benefits} onChange={handleChange} />
      </div>

      <div className="canvas-box product">
        <h3>Produto</h3>
        <textarea name="product" value={formData.product} onChange={handleChange} />
      </div>
      
      <div className="canvas-box requirements">
        <h3>Requisitos</h3>
        <textarea name="requirements" value={formData.requirements} onChange={handleChange} />
      </div>

      <div className="canvas-box stakeholders">
        <h3>Stakeholders</h3>
        <textarea name="stakeholders" value={formData.stakeholders} onChange={handleChange} />
      </div>

      <div className="canvas-box team">
        <h3>Equipe</h3>
        <textarea name="team" value={formData.team} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Sistemas</h3> 
        <textarea name="systems" value={formData.systems} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Premissas</h3>
        <textarea name="assumptions" value={formData.assumptions} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Entregas</h3>
        <textarea name="deliverables" value={formData.deliverables} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Restrições</h3>
        <textarea name="constraints" value={formData.constraints} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Riscos</h3>
        <textarea name="risks" value={formData.risks} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Cronograma</h3>
        <textarea name="timeline" value={formData.timeline} onChange={handleChange} />
      </div>

      <div className="canvas-box systems">
        <h3>Custos</h3>
        <textarea name="costs" value={formData.costs} onChange={handleChange} />
      </div>

      <div className="actions-bar">
        <button onClick={handleSave} className="btn-save">💾 Salvar Canvas</button>
      </div>
    </div>
  );
}