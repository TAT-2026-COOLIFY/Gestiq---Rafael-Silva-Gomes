import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './ProjectForm.css'

function ProjectForm() {
    const navigate = useNavigate()

    const [users, setUsers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Busca dados auxiliares para preencher os Selects
      Promise.all([
        api.get('users/'),
        api.get('areas/'),
        api.get('categories/')
      ])
      .then(([usersResponse, areasResponse, categoriesResponse]) => {
        // Ajuste: Verifica se os dados vêm em .results (paginação) ou direto
        setUsers(usersResponse.data.results || usersResponse.data)
        setAreas(areasResponse.data.results || areasResponse.data)
        setCategories(categoriesResponse.data.results || categoriesResponse.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Erro ao carregar dados do formulário: ", error);
        alert("Erro ao carregar listas (Usuários, Áreas ou Categorias). Verifique se o Backend está rodando.");
        setLoading(false);
      })
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        project_type: 'CORP',
        project_status: 'PLAN',
        start_date: '',
        end_date: '',
        pmo: '',
        leader: '',
        area: '',
        category: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const dadosParaEnviar = {
          ...formData,
          // Garante que datas vazias vão como null (evita erro no Django)
          start_date: formData.start_date || null,
          end_date: formData.end_date || null
        }

        api.post('projects/', dadosParaEnviar)
        .then(() => {
            alert("Projeto criado com sucesso!")
            navigate('/')
        })
        .catch((error) => {
            console.error("Erro ao salvar: ", error)
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Erro desconhecido.";
            alert("Erro ao criar projeto: " + msg)
        })
    }

    if (loading) {
      return <div className="loading-container">Carregando dados do formulário...</div>;
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
          <label htmlFor='name'>Nome do Projeto</label>
          <input 
            id='name' // JÁ TINHA ID, MANTIDO
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete='off'
            required 
            placeholder="Ex: Implantação de Wi-Fi"
          />
        </div>

        <div className="form-row">
          {/* PMO */}
          <div className="form-group">
            <label htmlFor='pmo'>PMO</label>
            <select 
                id='pmo' // ADICIONADO ID
                name="pmo" 
                value={formData.pmo} 
                onChange={handleChange} 
                required
            >
              <option value="">Selecione o PMO...</option>
              {users.map(item => (
                <option key={item.id} value={item.id}>
                  {item.username} {/* Se tiver first_name, pode usar item.first_name */}
                </option>
              ))}
            </select>
          </div>

          {/* Leader */}
          <div className="form-group">
            <label htmlFor='leader'>Líder</label>
            <select 
                id='leader' // ADICIONADO ID
                name="leader" 
                value={formData.leader} 
                onChange={handleChange} 
                required
            >
              <option value="">Selecione o Líder...</option>
              {users.map(item => (
                <option key={item.id} value={item.id}>
                  {item.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          {/* Area */}
          <div className="form-group">
            <label htmlFor='area'>Área</label>
            <select 
                id='area' // ADICIONADO ID
                name="area" 
                value={formData.area} 
                onChange={handleChange} 
                required
            >
              <option value="">Selecione...</option>
              {areas.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label htmlFor='category'>Categoria</label>
            <select 
                id='category' // ADICIONADO ID
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
            >
              <option value="">Selecione...</option>
              {categories.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          {/* Tipo */}
          <div className="form-group">
            <label htmlFor='project_type'>Tipo</label>
            <select 
                id='project_type'
                name="project_type" 
                value={formData.project_type} 
                onChange={handleChange}
            >
              <option value="CORP">Corporativo</option>
              <option value="DEP">Departamental</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor='project_status'>Status Inicial</label>
            <select 
                id='project_status'
                name="project_status" 
                value={formData.project_status} 
                onChange={handleChange}
            >
              <option value="PLAN">Planejamento</option>
              <option value="ACTIVE">Ativo</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          {/* Datas */}
          <div className="form-group">
            <label htmlFor='start_date'>Data de Início</label>
            <input 
              id='start_date'
              type="date" 
              name="start_date" 
              value={formData.start_date} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor='end_date'>Previsão de Fim</label>
            <input 
              id='end_date'
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