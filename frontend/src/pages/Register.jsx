import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Register() {
  const [formData, setFormData] = useState({
      username: "",
      email: "",
      first_name: "",
      password: "",
      confirm_password: ""
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica no Frontend
    if (formData.password !== formData.confirm_password) {
        alert("As senhas não conferem!");
        return;
    }

    try {
        // Envia para o backend (nota: não enviamos confirm_password)
        await api.post("register/", {
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            password: formData.password
        });
        
        alert("Conta criada com sucesso! Agora faça login.");
        navigate("/login"); // Redireciona para o login
    } catch (error) {
        console.error(error);
        if (error.response && error.response.data.username) {
            alert("Este nome de usuário já existe.");
        } else {
            alert("Erro ao criar conta. Tente novamente.");
        }
    }
  };

  return (
    <div className="login-container">
        {/* Reaproveitando a classe .login-box do CSS de Login */}
        <form onSubmit={handleSubmit} className="login-box" style={{marginTop: '50px'}}> 
            <h2>Crie sua conta</h2>
            
            <div className="input-group">
                <label htmlFor="username">Usuário (Login)</label>
                <input 
                    id="username"
                    name="username"
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    autoComplete="username"
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="name">Nome</label>
                <input 
                    id="name"
                    name="name"
                    type="text" 
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                    autoComplete="name"
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="email">E-mail</label>
                <input 
                    id="email"
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    autoComplete="email"
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="password">Senha</label>
                <input 
                    id="password"
                    name="password"
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                />
            </div>

            <div className="input-group">
                <label htmlFor="conf_password">Confirmar Senha</label>
                <input 
                    id="conf_password"
                    name="conf_password"
                    type="password" 
                    value={formData.confirm_password}
                    onChange={e => setFormData({...formData, confirm_password: e.target.value})}
                    required
                />
            </div>

            <button type="submit" className="login-btn">Cadastrar</button>
            
            <p style={{marginTop: '15px', textAlign: 'center', fontSize: '0.9rem'}}>
                Já tem conta? <Link to="/login">Faça Login</Link>
            </p>
        </form>
    </div>
  );
}

export default Register;