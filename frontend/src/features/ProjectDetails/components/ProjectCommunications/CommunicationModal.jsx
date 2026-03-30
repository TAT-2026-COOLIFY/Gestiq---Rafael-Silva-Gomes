import { Modal } from "@/components/Modal";
import { FormActions } from "@/components/FormActions";
import styles from "./CommunicationModal.module.css";

export function CommunicationModal({
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
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
      title="Adicionar Nova Comunicação"
      onClose={onClose}
      footer={
        <FormActions
          onCancel={onClose}
          saving={saving}
          saveLabel="Adicionar Comunicação"
          formId="communication-modal-form"
        />
      }
    >
      <form id="communication-modal-form" onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Descrição</label>
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Reunião de alinhamento semanal"
              required
              autoFocus
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="objective">Objetivo</label>
            <input
              id="objective"
              name="objective"
              value={form.objective}
              onChange={handleChange}
              placeholder="Ex: Validar entregas da sprint"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sender">Remetente</label>
            <input
              id="sender"
              name="sender"
              value={form.sender}
              onChange={handleChange}
              placeholder="Responsável"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="recipient">Destinatário</label>
            <input
              id="recipient"
              name="recipient"
              value={form.recipient}
              onChange={handleChange}
              placeholder="Público-alvo"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="channel">Meio</label>
            <select
              id="channel"
              name="channel"
              value={form.channel}
              onChange={handleChange}
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

        <button type="submit" style={{ display: "none" }} />
      </form>
    </Modal>
  );
}
