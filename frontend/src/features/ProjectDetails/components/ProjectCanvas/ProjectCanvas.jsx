import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import styles from "./ProjectCanvas.module.css";
import { Loading } from "@/components/Loading/Loading";
import { Save } from "lucide-react";

export function ProjectCanvas({ projectId }) {
  const [canvasId, setCanvasId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    justification: "", // Adicionado conforme imagem
    objective: "",      // Adicionado conforme imagem
    benefits: "",
    product: "",
    requirements: "",
    stakeholders: "",   // Áreas Envolvidas
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
    async function loadCanvas() {
      try {
        const res = await api.get(`canvas/?project=${projectId}`);
        const data = res.data.results ? res.data.results[0] : res.data[0];
        if (data) {
          setCanvasId(data.id);
          setFormData(data);
        }
      } catch (err) {
        console.error("Erro ao carregar Canvas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCanvas();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (canvasId) {
        await api.patch(`canvas/${canvasId}/`, formData);
      } else {
        const res = await api.post("canvas/", { ...formData, project: projectId });
        setCanvasId(res.data.id);
      }
      alert("Canvas salvo com sucesso!");
    } catch (err) {
      alert("Erro ao salvar canvas.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.canvasGrid}>
        
        {/* COLUNA 1: VERDE */}
        <div className={`${styles.column} ${styles.green}`}>
          <CanvasBox title="Justificativa" name="justification" value={formData.justification} onChange={handleChange} />
          <CanvasBox title="Objetivo" name="objective" value={formData.objective} onChange={handleChange} />
          <CanvasBox title="Benefícios" name="benefits" value={formData.benefits} onChange={handleChange} />
        </div>

        {/* COLUNA 2: ROXO */}
        <div className={`${styles.column} ${styles.purple}`}>
          <CanvasBox title="Produto" name="product" value={formData.product} onChange={handleChange} />
          <CanvasBox title="Requisitos" name="requirements" value={formData.requirements} onChange={handleChange} isLarge />
        </div>

        {/* COLUNA 3: LARANJA */}
        <div className={`${styles.column} ${styles.orange}`}>
          <CanvasBox title="Áreas Envolvidas" name="stakeholders" value={formData.stakeholders} onChange={handleChange} />
          <CanvasBox title="Equipe" name="team" value={formData.team} onChange={handleChange} />
          <CanvasBox title="Sistemas" name="systems" value={formData.systems} onChange={handleChange} />
        </div>

        {/* COLUNA 4: AZUL */}
        <div className={`${styles.column} ${styles.blue}`}>
          <CanvasBox title="Premissas" name="assumptions" value={formData.assumptions} onChange={handleChange} />
          <CanvasBox title="Entregas" name="deliverables" value={formData.deliverables} onChange={handleChange} isLarge />
          <CanvasBox title="Restrições" name="constraints" value={formData.constraints} onChange={handleChange} />
        </div>

        {/* COLUNA 5: AMARELO */}
        <div className={`${styles.column} ${styles.yellow}`}>
          <CanvasBox title="Riscos" name="risks" value={formData.risks} onChange={handleChange} />
          <CanvasBox title="Cronograma" name="timeline" value={formData.timeline} onChange={handleChange} />
          <CanvasBox title="Custos" name="costs" value={formData.costs} onChange={handleChange} />
        </div>

      </div>

      <div className={styles.actions}>
        <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
          <Save size={20} />
          {saving ? "Salvando..." : "Salvar Canvas"}
        </button>
      </div>
    </div>
  );
}

// Sub-componente para evitar repetição de código
function CanvasBox({ title, name, value, onChange, isLarge }) {
  return (
    <div className={`${styles.box} ${isLarge ? styles.large : ""}`}>
      <label>{title}</label>
      <textarea name={name} value={value} onChange={onChange} />
    </div>
  );
}