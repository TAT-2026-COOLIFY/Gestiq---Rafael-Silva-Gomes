import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/Button";
import styles from "./Login.module.css"

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState(null);
  const navigate = useNavigate()

  const showToast = useCallback((message, type = "error") => {
      setToast({ message, type });
  }, []);

  const { signIn } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await signIn(username, password)

      navigate('/')
    } catch (error) {
      showToast("Usuário ou senha incorretos!")
      console.error(error)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h1>Gestiq</h1>
        <h2>Acesso ao Sistema</h2>

        <div className={styles.inputGroup}>
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            name="username"
            autoComplete="username" 
            type="text" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit">Entrar</Button>
        <p className={styles.footerText}>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </form>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}