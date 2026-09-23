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
  types,
  priorities,
  members,
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
              autoFocus
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opcional..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
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
            <label htmlFor="milestone">Vincular ao Marco</label>
            <select
              id="milestone"
              name="milestone"
              value={form.milestone || ""}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um Marco</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.task}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              {types.map((ty) => (
                <option key={ty.id} value={ty.id}>
                  {ty.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priority">Prioridade</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="story_points">Estimativa</label>
            <input
              id="story_points"
              name="story_points"
              value={form.story_points}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="assigned_to">Responsável</label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={form.assigned_to || ""}
              onChange={handleChange}
            >
              <option value="">Não Atribuído</option>
              {members &&
                members.map((m) => (
                  <option key={m.id} value={m.user}>
                    {m.nome_completo || m.username}{" "}
                    {m.function ? `- ${m.function}` : ""}
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
