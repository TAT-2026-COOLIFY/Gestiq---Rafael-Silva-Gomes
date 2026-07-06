import { Modal } from "@/components/Modal";
import { FormActions } from "@/components/FormActions";
import styles from "./SprintModal.module.css";

export function SprintModal({ form, onFormChange, onClose, onSave, saving }) {
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
      title="Criar Nova Sprint"
      onClose={onClose}
      footer={
        <FormActions
          onCancel={onClose}
          saving={saving}
          saveLabel="Criar Sprint"
          formId="sprint-modal-form" 
        />
      }
    >
      <form id="sprint-modal-form" onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome da Sprint *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Sprint 1 - MVP"
            required
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="goal">Objetivo da Sprint</label>
          <textarea
            id="goal"
            name="goal"
            value={form.goal}
            onChange={handleChange}
            placeholder="Qual a meta principal dessa sprint?"
            rows={3}
          />
        </div>

        <div className={styles.datesGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="start_date">Data de Início</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="end_date">Data de Término</label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" style={{ display: "none" }} />
      </form>
    </Modal>
  );
}
