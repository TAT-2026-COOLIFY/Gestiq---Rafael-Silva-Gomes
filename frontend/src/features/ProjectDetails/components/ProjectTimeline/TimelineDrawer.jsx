import { useState, useEffect } from "react";
import { Drawer } from "@/components/Drawer";
import { FormActions } from "@/components/FormActions";
import { Trash2 } from "lucide-react";
import styles from "./TimelineDrawer.module.css";

export function TimelineDrawer({
  milestone,
  onClose,
  onSave,
  onDelete,
  saving,
}) {
  const [form, setForm] = useState(milestone);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(milestone);
    setIsDirty(false);
  }, [milestone]);

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
      title="Editar Marco"
      subtitle={`ID: ${milestone.id}`}
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
            onClick={() => onDelete(milestone.id)}
            className={styles.deleteBtn}
          >
            <Trash2 size={18} /> Excluir
          </button>

          <FormActions
            onCancel={onClose}
            saving={saving}
            isDirty={isDirty}
            saveLabel="Salvar Alterações"
            formId="milestone-drawer-form"
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit} id="milestone-drawer-form">
        <div className={styles.formGroup}>
          <label htmlFor="task">Nome do Marco</label>
          <input
            id="task"
            name="task"
            value={form.task}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="start_date">Início</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="end_date">Fim</label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.statsCard}>
          <p>
            <strong>Progresso Planejado (Dias):</strong>{" "}
            {milestone.percentage_plan}%
          </p>
          <p>
            <strong>Progresso Real (Tarefas):</strong>{" "}
            {milestone.percentage_real}%
          </p>
        </div>

        <button type="submit" style={{ display: "none" }} aria-hidden="true" />
      </form>
    </Drawer>
  );
}
