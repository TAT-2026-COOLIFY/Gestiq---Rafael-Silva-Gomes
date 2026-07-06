import { useState } from "react";
import { Drawer } from "@/components/Drawer";
import { FormActions } from "@/components/FormActions";
import styles from "./CommunicationDrawer.module.css";

export function CommunicationDrawer({
  communication,
  onClose,
  onSave,
  saving,
  canEdit,
}) {
  const [form, setForm] = useState(communication);
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

  return (
    <Drawer
      title={canEdit ? "Editar Comunicação" : "Detalhes da Comunicação"}
      subtitle={`ID: ${communication.id}`}
      onClose={onClose}
      footer={
        canEdit ? (
          <FormActions
            onCancel={onClose}
            saving={saving}
            isDirty={isDirty}
            saveLabel="Salvar Alterações"
            formId="communication-drawer-form"
          />
        ) : null
      }
    >
      <form
        onSubmit={handleSubmit}
        id="communication-drawer-form"
        className={styles.formContainer}
      >
        <div className={styles.formGroup}>
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            required
            placeholder="Descreva a atividade de comunicação..."
            readOnly={!canEdit}
            disabled={!canEdit}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="objective">Objetivo</label>
          <textarea
            id="objective"
            name="objective"
            value={form.objective}
            onChange={handleChange}
            rows={3}
            required
            placeholder="Qual o resultado esperado?"
            readOnly={!canEdit}
            disabled={!canEdit}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="sender">Remetente</label>
            <input
              id="sender"
              name="sender"
              value={form.sender}
              onChange={handleChange}
              required
              readOnly={!canEdit}
              disabled={!canEdit}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="recipient">Destinatário</label>
            <input
              id="recipient"
              name="recipient"
              value={form.recipient}
              onChange={handleChange}
              required
              readOnly={!canEdit}
              disabled={!canEdit}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="channel">Meio</label>
            <select
              id="channel"
              name="channel"
              value={form.channel}
              onChange={handleChange}
              required
              disabled={!canEdit}
            >
              <option value="EMAIL">E-mail</option>
              <option value="TEAMS">Teams</option>
              <option value="WHATS">WhatsApp</option>
              <option value="PHONE">Telefone</option>
              <option value="MEET">Reunião Presencial</option>
              <option value="OL_MEET">Reunião Online</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="frequency">Frequência</label>
            <select
              id="frequency"
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              required
              disabled={!canEdit}
            >
              <option value="ONCE">Uma única vez</option>
              <option value="DAILY">Diária</option>
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensal</option>
              <option value="MEETING">Após cada reunião</option>
              <option value="NEEDED">Conforme Necessário</option>
            </select>
          </div>
        </div>
        <button type="submit" style={{ display: "none" }} aria-hidden="true" />
      </form>
    </Drawer>
  );
}
