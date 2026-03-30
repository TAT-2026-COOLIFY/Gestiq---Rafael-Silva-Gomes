import { useState, useEffect } from "react";
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
}) {
  const [form, setForm] = useState({
    ...task,
    milestone: task.milestone || "",
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm({ ...task, milestone: task.milestone || "" });
    setIsDirty(false);
  }, [task]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    setIsDirty(false);
  }

  return (
    <Drawer
      title="Editar Tarefa"
      subtitle={`ID: ${task.id}`}
      onClose={onClose}
      footer={
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
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Descrição</label>

          <input
            id="description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="status">Status (Coluna)</label>
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
            <label htmlFor="milestone">Marco (Milestone)</label>
            <select
              id="milestone"
              name="milestone"
              value={form.milestone}
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

        <button type="submit" style={{ display: "none" }} aria-hidden="true" />
      </form>
    </Drawer>
  );
}
