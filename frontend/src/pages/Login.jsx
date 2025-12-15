import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()

    api.post('token/', { username, password })
      .then(response => {
        const token = response.data.access

        localStorage.setItem('token', token)

        navigate('/')
      })
      .catch(error => {
        alert("Usuário ou senha incorretos!")
        console.error(error)
      })
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Gestão de Projetos</h1>
        <h2>Acesso ao Sistema</h2>
        
        <div className="input-group">
          <label htmlFor="username">Usuário</label>
          <input 
            id="username"
            name="username"
            autoComplete="username"
            type="text" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input 
            id="password" 
            name="password" 
            autoComplete="current-password"
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">ENTRAR</button>
      </form>
    </div>
  )
}

export default Login