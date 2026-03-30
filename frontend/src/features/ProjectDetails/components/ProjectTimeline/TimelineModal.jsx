import { Modal } from "@/components/Modal";
import { FormActions } from "@/components/FormActions";
import styles from "./TimelineModal.module.css";

export function TimelineModal({ form, onFormChange, onClose, onSave, saving }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      title="Adicionar Novo Marco"
      onClose={onClose}
      footer={
        <FormActions onCancel={onClose} saving={saving} saveLabel="Adicionar Marco" formId="milestone-modal-form" />
      }
    >
      <form id="milestone-modal-form" onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="task">Nome do Marco</label>
            <input
              id="task"
              name="task"
              value={form.task}
              onChange={handleChange}
              placeholder="Ex: Fase de Planejamento"
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="start_date">Data de Início</label>
            <input
              id="start_date"
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="end_date">Data de Fim</label>
            <input
              id="end_date"
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </div>

        </div>
        <button type="submit" style={{ display: "none" }} />
      </form>
    </Modal>
  );
}