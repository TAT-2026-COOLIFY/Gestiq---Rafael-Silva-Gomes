import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { projectFormService } from "./services/projectFormService";
import { Loading } from "@/components/Loading/Loading";
import { Toast } from "@/components/Toast";
import styles from "./ProjectForm.module.css";

const INITIAL_FORM = {
  name: "",
  project_type: "CORP",
  project_status: "PLAN",
  start_date: "",
  end_date: "",
  area: "",
  category: "",
};

export function ProjectForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [areas, setAreas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = "Novo Projeto | Gestiq";
  });

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    projectFormService
      .getFormData()
      .then(({ areas, categories }) => {
        setAreas(areas);
        setCategories(categories);
      })
      .catch(() => showToast("Erro ao carregar dados do formulário."))
      .finally(() => setLoading(false));
  }, [showToast]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await projectFormService.createProject(formData);
      showToast("Projeto criado com sucesso!", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      const msg = error.response?.data
        ? Object.values(error.response.data).flat().join(" ")
        : "Erro ao criar projeto. Tente novamente.";
      showToast(msg);
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Novo Projeto</h1>
          <p>Preencha as informações básicas do projeto</p>
        </div>
        <Link to="/" className={styles.cancelBtn}>
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome do Projeto</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Implantação de Wi-Fi"
              autoComplete="off"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="area">Área</label>
              <select
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                {areas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">Categoria</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="project_type">Tipo</label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
              >
                <option value="CORP">Corporativo</option>
                <option value="DEP">Departamental</option>
                <option value="PES">Pessoal</option>
                <option value="ACAD">Acadêmico</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="project_status">Status Inicial</label>
              <select
                id="project_status"
                name="project_status"
                value={formData.project_status}
                onChange={handleChange}
              >
                <option value="PLAN">A iniciar</option>
                <option value="ACTIVE">Em andamento</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_date">Data de Início</label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="end_date">Previsão de Fim</label>
              <input
                id="end_date"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/" className={styles.cancelBtn}>
              Cancelar
            </Link>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Salvando..." : "Criar Projeto"}
            </button>
          </div>
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
