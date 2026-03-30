import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import styles from "./ProjectCanvas.module.css";
import { Loading } from "@/components/Loading/Loading";
import { Save, CheckCircle, Clock } from "lucide-react";

export function ProjectCanvas({ projectId }) {
  const [canvasId, setCanvasId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Salvo");

  const [formData, setFormData] = useState({
    justification: "",
    objective: "",
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
    costs: "",
  });

  useEffect(() => {
    async function loadCanvas() {
      try {
        const res = await api.get(`canvas/?project=${projectId}`);

        let data = null;
        if (res.data?.results && res.data.results.length > 0) {
          data = res.data.results[0];
        } else if (Array.isArray(res.data) && res.data.length > 0) {
          data = res.data[0];
        } else if (res.data && res.data.id) {
          data = res.data;
        }

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
    setIsDirty(true);
    setSaveStatus("Pendente");
  };

  useEffect(() => {
    if (!isDirty) return;

    setSaveStatus("Salvando...");

    const timer = setTimeout(async () => {
      try {
        if (canvasId) {
          await api.patch(`canvas/${canvasId}/`, formData);
          setSaveStatus("Salvo");
          setIsDirty(false);
        } else {
          const res = await api.post("canvas/", {
            ...formData,
            project: Number(projectId),
          });
          setCanvasId(res.data.id);
          setSaveStatus("Salvo");
          setIsDirty(false);
        }
      } catch (err) {
        console.error("Erro ao salvar canvas:", err);
        setSaveStatus("Erro");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, isDirty, canvasId, projectId]);

  if (loading) return <Loading />;

  const statusClass = saveStatus.replace("...", "").toLowerCase();

  return (
    <div className={styles.container}>
      <div className={styles.canvasGrid}>
        <div className={`${styles.column} ${styles.green}`}>
          <CanvasBox
            title="Justificativa"
            name="justification"
            value={formData.justification}
            onChange={handleChange}
          />
          <CanvasBox
            title="Objetivo"
            name="objective"
            value={formData.objective}
            onChange={handleChange}
          />
          <CanvasBox
            title="Benefícios"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
          />
        </div>

        <div className={`${styles.column} ${styles.purple}`}>
          <CanvasBox
            title="Produto"
            name="product"
            value={formData.product}
            onChange={handleChange}
          />
          <CanvasBox
            title="Requisitos"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            isLarge
          />
        </div>

        <div className={`${styles.column} ${styles.orange}`}>
          <CanvasBox
            title="Áreas Envolvidas"
            name="stakeholders"
            value={formData.stakeholders}
            onChange={handleChange}
          />
          <CanvasBox
            title="Equipe"
            name="team"
            value={formData.team}
            onChange={handleChange}
          />
          <CanvasBox
            title="Sistemas"
            name="systems"
            value={formData.systems}
            onChange={handleChange}
          />
        </div>

        <div className={`${styles.column} ${styles.blue}`}>
          <CanvasBox
            title="Premissas"
            name="assumptions"
            value={formData.assumptions}
            onChange={handleChange}
          />
          <CanvasBox
            title="Entregas"
            name="deliverables"
            value={formData.deliverables}
            onChange={handleChange}
            isLarge
          />
          <CanvasBox
            title="Restrições"
            name="constraints"
            value={formData.constraints}
            onChange={handleChange}
          />
        </div>

        <div className={`${styles.column} ${styles.yellow}`}>
          <CanvasBox
            title="Riscos"
            name="risks"
            value={formData.risks}
            onChange={handleChange}
          />
          <CanvasBox
            title="Cronograma"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
          />
          <CanvasBox
            title="Custos"
            name="costs"
            value={formData.costs}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <div className={`${styles.saveIndicator} ${styles[statusClass]}`}>
          {saveStatus === "Salvando..." && <Clock size={18} />}
          {saveStatus === "Salvo" && <CheckCircle size={18} />}
          {saveStatus === "Pendente" && <Save size={18} />}
          {saveStatus === "Erro" && <Save size={18} />}
          <span>{saveStatus}</span>
        </div>
      </div>
    </div>
  );
}

function CanvasBox({ title, name, value, onChange, isLarge }) {
  return (
    <div className={`${styles.box} ${isLarge ? styles.large : ""}`}>
      <label>{title}</label>
      <textarea name={name} value={value} onChange={onChange} />
    </div>
  );
}
