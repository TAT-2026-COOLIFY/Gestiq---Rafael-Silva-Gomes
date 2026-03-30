import styles from "./FormActions.module.css";

export function FormActions({
  onCancel,
  saving,
  isDirty = true,
  saveLabel = "Salvar",
  formId,
}) {
  return (
    <>
      <button type="button" className={styles.cancelBtn} onClick={onCancel}>
        Cancelar
      </button>
      <button
        type="submit"
        form={formId}
        className={styles.saveBtn}
        disabled={saving || !isDirty}
      >
        {saving ? "Salvando..." : saveLabel}
      </button>
    </>
  );
}
