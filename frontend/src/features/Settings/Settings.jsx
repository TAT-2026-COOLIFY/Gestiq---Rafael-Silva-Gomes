import { useEffect, useState, useCallback } from "react";
import { settingsService } from "./services/settingsService";
import { Loading } from "@/components/Loading/Loading";
import { Toast } from "@/components/Toast";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import styles from "./Settings.module.css";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  job_title: "",
  department: "",
};

export function Settings() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = "Configurações | Gestiq";
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    settingsService
      .getProfile()
      .then((data) => {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          job_title: data.job_title || "",
          department: data.department || "",
        });
        if (data.photo) setPhotoPreview(data.photo);
      })
      .catch(() => showToast("Erro ao carregar dados do perfil.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsService.updateProfile(formData, photoFile);
      if (updated.photo) setPhotoPreview(updated.photo);
      setPhotoFile(null);
      showToast("Perfil atualizado com sucesso!");
    } catch {
      showToast("Erro ao salvar. Tente novamente.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Meu Perfil</h2>
        <p>Gerencie suas informações e foto de exibição</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.photoSection}>
            <div className={styles.avatarBox}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Avatar"
                  className={styles.avatarImg}
                />
              ) : (
                <span className={styles.avatarInitials}>
                  {formData.first_name
                    ? formData.first_name[0].toUpperCase()
                    : "?"}
                </span>
              )}
            </div>
            <label htmlFor="file-upload" className={styles.uploadBtn}>
              📷 Alterar Foto
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </div>

          <hr className={styles.divider} />

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="first_name">Nome</label>
              <input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="last_name">Sobrenome</label>
              <input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="job_title">Cargo</label>
              <input
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="Ex: Gerente de Projetos"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="department">Departamento</label>
              <input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Ex: TI"
              />
            </div>
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
