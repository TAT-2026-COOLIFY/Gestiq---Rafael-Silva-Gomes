import { Modal } from "@/components/Modal";
import { FormActions } from "@/components/FormActions";
import styles from "./KanbanModal.module.css";

export function KanbanModal({
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
  milestones,
  columns,
}) {
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
      title="Nova Tarefa"
      onClose={onClose}
      footer={
        <FormActions
          onCancel={onClose}
          saving={saving}
          saveLabel="Criar Tarefa"
          formId="task-modal-form"
        />
      }
    >
      <form id="task-modal-form" onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="title">Título da Tarefa</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Descrição</label>
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opcional..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Coluna Inicial</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="milestone">Vincular ao Marco (Opcional)</label>
            <select
              id="milestone"
              name="milestone"
              value={form.milestone || ""}
              onChange={handleChange}
            >
              <option value="">Nenhum Marco</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.task}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" style={{ display: "none" }} />
      </form>
    </Modal>
  );
}
