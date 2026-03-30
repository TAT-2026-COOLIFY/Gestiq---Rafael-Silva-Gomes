import { useState } from "react";
import { Modal } from "@/components/Modal";
import { FormActions } from "@/components/FormActions";
import styles from "./TeamModal.module.css";
import { Popup } from "@/components/Popup";
import { Form } from "react-router-dom";

const INITIAL_FORM = {
  email: "",
  function: "",
};

export function TeamModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState(INITIAL_FORM);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <Modal
      title="Convidar Membro"
      onClose={onClose}
      maxWidth={480}
      footer={
        <FormActions
          onCancel={onClose}
          saving={saving}
          saveLabel="Convidar"
          formId="team-modal-form"
        />
      }
    >
      <form id="team-modal-form" onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="exemplo@gmail.com"
            autoComplete="off"
            required
          />
          <span className={styles.hint}>
            O usuário já deve ter cadastrado no sistema.
          </span>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="function">Função no Projeto</label>
          <input
            id="function"
            name="function"
            type="text"
            value={form.function}
            onChange={handleChange}
            placeholder="Ex: Desenvolvedor, Líder do Projeto, Participante..."
          />
        </div>
      </form>
    </Modal>
  );
}
