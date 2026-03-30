import { Modal } from "@/components/Modal";
import { FormActions } from "@/components/FormActions";
import styles from "./RiskModal.module.css";

const SCORE_OPTIONS = [
  { value: "0.10", label: "Muito Baixo" },
  { value: "0.30", label: "Baixo" },
  { value: "0.50", label: "Médio" },
  { value: "0.70", label: "Alto" },
  { value: "0.90", label: "Muito Alto" },
];

export function RiskModal({ form, onFormChange, onClose, onSave, saving }) {
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    onFormChange((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <Modal
      title="Adicionar Novo Risco"
      onClose={onClose}
      footer={
        <FormActions
          onCancel={onClose}
          saving={saving}
          saveLabel="Adicionar Risco"
          formId="risk-modal-form"
        />
      }
    >
      <form id="risk-modal-form" onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="description">Descrição</label>
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva o risco..."
              required
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Categoria</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="TEC">Técnico</option>
              <option value="EXT">Externo</option>
              <option value="ORG">Organizacional</option>
              <option value="GP">Gestão de Projetos</option>
            </select>
          </div>
        </div>

        <div className={styles.scoresGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="cost">Custo</label>
            <select
              id="cost"
              name="cost"
              value={form.cost}
              onChange={handleChange}
            >
              {SCORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
            >
              {SCORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="scope">Escopo</label>
            <select
              id="scope"
              name="scope"
              value={form.scope}
              onChange={handleChange}
            >
              {SCORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
            >
              {SCORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="probability">Probabilidade</label>
            <select
              id="probability"
              name="probability"
              value={form.probability}
              onChange={handleChange}
            >
              {SCORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="action">Ação</label>
            <select
              id="action"
              name="action"
              value={form.action}
              onChange={handleChange}
            >
              <option value="MITIGAR">Mitigar</option>
              <option value="ACEITAR">Aceitar</option>
              <option value="TRANSFERIR">Transferir</option>
              <option value="ELIMINAR">Eliminar</option>
            </select>
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="mitigation_plan">Plano de Ação</label>
            <input
              id="mitigation_plan"
              name="mitigation_plan"
              value={form.mitigation_plan}
              onChange={handleChange}
              placeholder="Descreva o plano..."
            />
          </div>
        </div>
        <button type="submit" style={{ display: "none" }} />
      </form>
    </Modal>
  );
}
