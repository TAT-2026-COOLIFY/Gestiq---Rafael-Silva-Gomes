import { useEffect, useState } from "react";
import api from "../services/api";
import "./Settings.css";

function Settings() {
  const [loading, setLoading] = useState(true);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    job_title: "",
    department: "",
  });

  // Estado para controlar a foto
  const [photoFile, setPhotoFile] = useState(null);       // O arquivo físico para enviar
  const [photoPreview, setPhotoPreview] = useState(null); // A URL para mostrar na tela

  useEffect(() => {
    // Busca dados do endpoint '/me/'
    api.get("me/")
      .then((res) => {
        const data = res.data;
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          job_title: data.job_title || "",
          department: data.department || "",
        });

        // Se o usuário já tiver foto, configura o preview
        if (data.photo) {
           // Lógica para montar a URL completa se vier relativa (/media/...)
           const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
           const fullUrl = data.photo.startsWith("http") ? data.photo : `${baseUrl}${data.photo}`;
           setPhotoPreview(fullUrl);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar perfil:", err);
        alert("Erro ao carregar dados do usuário.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      // Cria uma URL temporária só para mostrar a foto nova imediatamente
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Cria o envelope FormData
    const dataToSend = new FormData();
    dataToSend.append("first_name", formData.first_name);
    dataToSend.append("last_name", formData.last_name);
    dataToSend.append("email", formData.email);
    dataToSend.append("job_title", formData.job_title);
    dataToSend.append("department", formData.department);

    // 2. Se tiver arquivo novo, coloca no envelope
    if (photoFile) {
      dataToSend.append("photo", photoFile);
    }

    // 3. Envia para o Backend
    api.put("me/", dataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(() => {
      alert("Perfil atualizado com sucesso!");
      // Recarrega a página para atualizar header/sidebar se tiver foto lá
      window.location.reload();
    })
    .catch((err) => {
      console.error(err);
      alert("Erro ao salvar. Verifique o console.");
    });
  };

  if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Carregando perfil...</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Meu Perfil</h2>
        <p>Gerencie suas informações e foto de exibição</p>
      </div>
      
      <div className="settings-card">
        <form onSubmit={handleSubmit}>
          
          {/* --- FOTO --- */}
          <div className="photo-upload-section">
            <div className="avatar-preview-box">
              {photoPreview ? (
                <img src={photoPreview} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="avatar-initials">
                  {formData.first_name ? formData.first_name[0].toUpperCase() : "?"}
                </span>
              )}
            </div>
            
            <label htmlFor="file-upload" className="custom-file-upload">
              📷 Alterar Foto
            </label>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange}
              style={{display: 'none'}} 
            />
          </div>

          <hr style={{border:'0', borderTop:'1px solid #eee', margin:'20px 0'}} />

          {/* --- CAMPOS --- */}
          <div className="form-row">
            <div className="form-group">
                <label>Nome</label>
                <input 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <div className="form-group">
                <label>Sobrenome</label>
                <input 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleChange} 
                />
            </div>
          </div>

          <div className="form-group" style={{marginBottom: '15px'}}>
            <label>E-mail (Login)</label>
            <input 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Cargo</label>
                <input 
                    name="job_title" 
                    value={formData.job_title} 
                    onChange={handleChange} 
                    placeholder="Ex: Gerente de Projetos"
                />
            </div>
            <div className="form-group">
                <label>Departamento</label>
                <input 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    placeholder="Ex: TI"
                />
            </div>
          </div>

          <button type="submit" className="btn-save">Salvar Alterações</button>

        </form>
      </div>
    </div>
  );
}

export default Settings;