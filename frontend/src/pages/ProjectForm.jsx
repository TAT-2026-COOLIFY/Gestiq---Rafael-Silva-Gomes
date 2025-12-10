import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './ProjectForm.css'

function ProjectForm() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        project_type: 'CORP',
        project_status: 'PLAN',
        start_date: '',
        end_date: '',
        pmo: 1,
        leader: 1,
        area: 1,
        category: 3
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        api.post('projects/', formData)
        .then(() => {
            alert("Projeto criado com sucesso!")
            navigate('/')
        })
        .catch((error) => {
            console.error("Erro ao salvar: ", error)
            alert("Erro ao criar projeto. Veja o console (F12) para detalhes.")
        })
    }

    return (
    <div className="form-container">
      <div className="form-header">
        <h1>Novo Projeto</h1>
        <Link to="/" className="cancel-btn">Cancelar</Link>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        
        {/* Nome do Projeto */}
        <div className="form-group">
          <label>Nome do Projeto</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required 
            placeholder="Ex: Implantação de Wi-Fi"
          />
        </div>

        <div className="form-row">
          {/* Tipo */}
          <div className="form-group">
            <label>Tipo</label>
            <select name="project_type" value={formData.project_type} onChange={handleChange}>
              <option value="CORP">Corporativo</option>
              <option value="DEP">Departamental</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label>Status Inicial</label>
            <select name="project_status" value={formData.project_status} onChange={handleChange}>
              <option value="PLAN">Planejamento</option>
              <option value="ACTIVE">Ativo</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          {/* Datas */}
          <div className="form-group">
            <label>Data de Início</label>
            <input 
              type="date" 
              name="start_date" 
              value={formData.start_date} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Previsão de Fim</label>
            <input 
              type="date" 
              name="end_date" 
              value={formData.end_date} 
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="save-btn">Salvar Projeto</button>
      </form>
    </div>
  )
}

export default ProjectForm