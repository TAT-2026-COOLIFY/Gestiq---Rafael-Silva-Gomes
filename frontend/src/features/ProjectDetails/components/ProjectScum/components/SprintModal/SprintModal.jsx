import { Modal } from "@/components/Modal";
import styles from "./SprintModal.module.css";

export function SprintModal({
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
  canEdit,
  isEditing,
}) {
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
      title={isEditing ? "Detalhes da Sprint" : "Criar Nova Sprint"}
      onClose={onClose}
      footer={
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            {canEdit ? "Cancelar" : "Fechar"}
          </button>

          {canEdit && (
            <button
              type="submit"
              form="sprint-modal-form"
              disabled={saving}
              className={styles.saveBtn}
            >
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Atualizar Sprint"
                  : "Criar Sprint"}
            </button>
          )}
        </div>
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
            disabled={!canEdit}
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
            disabled={!canEdit}
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
              disabled={!canEdit}
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
              disabled={!canEdit}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
