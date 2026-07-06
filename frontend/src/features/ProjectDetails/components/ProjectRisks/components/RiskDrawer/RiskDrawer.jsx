import { useState } from "react";
import { Drawer } from "@/components/Drawer";
import { FormActions } from "@/components/FormActions";
import styles from "./RiskDrawer.module.css";

const SCORE_OPTIONS = [
  { value: "0.10", label: "Muito Baixo" },
  { value: "0.30", label: "Baixo" },
  { value: "0.50", label: "Médio" },
  { value: "0.70", label: "Alto" },
  { value: "0.90", label: "Muito Alto" },
];

function getScoreLevel(score) {
  if (score >= 0.45) return { label: "Alto", color: styles.high };
  if (score >= 0.21) return { label: "Médio", color: styles.medium };
  return { label: "Baixo", color: styles.low };
}

export function RiskDrawer({ risk, onClose, onSave, saving, canEdit }) {
  const [form, setForm] = useState(risk);
  const [isDirty, setIsDirty] = useState(false);

  function handleChange(e) {
    if (!canEdit) return;

    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canEdit) return;
    onSave(form);
    setIsDirty(false);
  }

  const score = parseFloat(form.score ?? 0);
  const level = getScoreLevel(score);

  return (
    <Drawer
      title={canEdit ? "Editar Risco" : "Detalhes do Risco"}
      subtitle={
        <span className={`${styles.scoreBadge} ${level.color}`}>
          Score {score.toFixed(2)} - {level.label}
        </span>
      }
      onClose={onClose}
      footer={
        canEdit ? (
          <FormActions
            onCancel={onClose}
            saving={saving}
            isDirty={isDirty}
            saveLabel="Salvar Alterações"
            formId="risk-drawer-form"
          />
        ) : null
      }
    >
      <form onSubmit={handleSubmit} id="risk-drawer-form">
        <div className={styles.formGroup}>
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            required
            readOnly={!canEdit}
            disabled={!canEdit}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={!canEdit}
            >
              <option value="TEC">Técnico</option>
              <option value="EXT">Externo</option>
              <option value="ORG">Organizacional</option>
              <option value="GP">Gestão de Projetos</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="action">Ação</label>
            <select
              id="action"
              name="action"
              value={form.action}
              onChange={handleChange}
              disabled={!canEdit}
            >
              <option value="MITIGAR">Mitigar</option>
              <option value="ACEITAR">Aceitar</option>
              <option value="TRANSFERIR">Transferir</option>
              <option value="ELIMINAR">Eliminar</option>
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="cost">Custo</label>
            <select
              id="cost"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              disabled={!canEdit}
            >
              {SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="timeline">Cronograma</label>
            <select
              id="timeline"
              name="timeline"
              value={form.timeline}
              onChange={handleChange}
              disabled={!canEdit}
            >
              {SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="scope">Escopo</label>
            <select
              id="scope"
              name="scope"
              value={form.scope}
              onChange={handleChange}
              disabled={!canEdit}
            >
              {SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="quality">Qualidade</label>
            <select
              id="quality"
              name="quality"
              value={form.quality}
              onChange={handleChange}
              disabled={!canEdit}
            >
              {SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="probability">Probabilidade</label>
            <select
              id="probability"
              name="probability"
              value={form.probability}
              onChange={handleChange}
              disabled={!canEdit}
            >
              {SCORE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={!canEdit}
            >
              <option value="INICIAR">A Iniciar</option>
              <option value="ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="action_plan">Plano de Ação</label>
          <textarea
            id="action_plan"
            name="action_plan"
            value={form.action_plan ?? ""}
            onChange={handleChange}
            rows={4}
            placeholder="Descreva o plano de ação..."
            readOnly={!canEdit}
            disabled={!canEdit}
          />
        </div>
      </form>
    </Drawer>
  );
}
