import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Loading } from "@/components/Loading/Loading";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/Button";
import styles from "./Register.module.css";

export function Register() {
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const showToast = useCallback((message, type = "error") => {
        setToast({ message, type });
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            showToast("As senhas não conferem!");
            return;
        }

        if (formData.password.length < 8) {
            showToast("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        setLoading(true);

        try {
            await authService.register({
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
            });
            showToast("Conta criada com sucesso! Redirecionando...", "success");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            const data = error.response?.data;
            if (data?.username) {
                showToast("Este nome de usuário já existe.");
            } else if (data?.email) {
                showToast("Este e-mail já está em uso.");
            } else {
                showToast("Erro ao criar conta. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loading />;

    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerBox}>
                <div className={styles.header}>
                    <h2>Crie sua conta</h2>
                    <p>Preencha os dados abaixo para começar</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Usuário</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Seu nome de usuário"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="first_name">Primeiro Nome</label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="João"
                                autoComplete="given-name"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="last_name">Sobrenome</label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Silva"
                                autoComplete="family-name"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="joao@email.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirm_password">Confirmar Senha</label>
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Repita a senha"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit">
                        {loading ? "Criando conta..." : "Criar Conta"}
                    </Button>

                    <p className={styles.footerText}>
                        Já tem conta? <Link to="/login">Faça Login</Link>
                    </p>
                </form>
            </div>

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}