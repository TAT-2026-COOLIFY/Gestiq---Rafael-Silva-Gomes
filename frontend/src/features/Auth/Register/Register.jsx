import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Button } from "@/components/Button";
import styles from "./Register.module.css";

export function Register() {
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

    if (formData.password !== formData.confirm_password) {
        alert("As senhas não conferem!");
        return;
    }

    try {
        await authService.register ({
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            password: formData.password
        });
        
        alert("Conta criada com sucesso! Realize o login.");
        navigate("/login");
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
    <div className={styles.registerContainer}>
        <form onSubmit={handleSubmit} className={styles.registerBox}> 
            <h2>Crie sua conta</h2>
            
            <div className={styles.inputGroup}>
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

            <div className={styles.inputGroup}>
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

            <div className={styles.inputGroup}>
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

            <div className={styles.inputGroup}>
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

            <div className={styles.inputGroup}>
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

            <Button type="submit">Cadastrar</Button>
            
            <p className={styles.footerText}>
                Já tem conta? <Link to="/login">Faça Login</Link>
            </p>
        </form>
    </div>
  );
}