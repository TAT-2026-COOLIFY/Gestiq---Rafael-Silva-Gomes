import { useState } from "react";
import { Drawer } from "@/components/Drawer";
import { FormActions } from "@/components/FormActions";
import { Trash2 } from "lucide-react";
import styles from "./KanbanDrawer.module.css";

export function KanbanDrawer({
  task,
  onClose,
  onSave,
  onDelete,
  saving,
  milestones,
  columns,
  types,
  priorities,
  members,
  canEdit,
}) {
  const [form, setForm] = useState({
    ...task,
    milestone: task.milestone || "",
  });
  const [isDirty, setIsDirty] = useState(false);

  function handleChange(e) {
    if (!canEdit) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }

  function handleSubmit(e) {
    if (!canEdit) return;
    e.preventDefault();
    onSave(form);
    setIsDirty(false);
  }

  return (
    <Drawer
      title={canEdit ? "Editar Tarefa" : "Detalhes da Tarefa"}
      subtitle={`ID: ${task.id}`}
      onClose={onClose}
      footer={
        canEdit ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className={styles.deleteBtn}
            >
              <Trash2 size={18} /> Excluir
            </button>
            <FormActions
              onCancel={onClose}
              saving={saving}
              isDirty={isDirty}
              saveLabel="Salvar"
              formId="task-drawer-form"
            />
          </div>
        ) : null
      }
    >
      <form onSubmit={handleSubmit} id="task-drawer-form">
        <div className={styles.formGroup}>
          <label htmlFor="title">Título da Tarefa</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            readOnly={!canEdit}
            disabled={!canEdit}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Descrição</label>

          <input
            id="description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            readOnly={!canEdit}
            disabled={!canEdit}
          />
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
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
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
            disabled={!canEdit}
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
            disabled={!canEdit}
          >
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="milestone">Marco</label>
          <select
            id="milestone"
            name="milestone"
            value={form.milestone}
            onChange={handleChange}
            disabled={!canEdit}
          >
            <option value="">Nenhum Marco</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.task}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="members">Responsável</label>
          <select
            id="assigned_to"
            name="assigned_to"
            value={form.assigned_to || ""}
            onChange={handleChange}
            disabled={!canEdit}
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

        <button type="submit" style={{ display: "none" }} aria-hidden="true" />
      </form>
    </Drawer>
  );
}
