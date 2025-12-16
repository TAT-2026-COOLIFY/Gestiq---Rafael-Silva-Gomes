import { useState, useEffect } from "react";
import api from "../services/api";
import { Link, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Layout.css";

function Layout() {
  const [firstName, setFirstName] = useState("");
  const [isOpen, setIsOpen] = useState(false); // <--- Novo Estado: Menu Aberto/Fechado

  // Função para abrir/fechar o menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Fecha o menu se clicar em um link (opcional, bom para mobile)
  const handleLinkClick = () => setIsOpen(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.user_id;
        api.get(`users/${userId}/`)
          .then(response => {
            setFirstName(response.data.first_name || response.data.username);
          })
          .catch(console.error);
      } catch (error) {
        console.error("Erro ao decodificar token", error);
      }
    }
  }, []);

  return (
    <div className="layout-container">
      
      {/* 1. O Menu Lateral (Sidebar) */}
      {/* Se isOpen for true, adiciona a classe 'open' */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
            <div className="logo">Gestão TCC</div>
            {/* Botão X para fechar dentro do menu */}
            <button className="btn-close" onClick={toggleMenu}>&times;</button>
        </div>

        <nav>
          <Link to="/" className="menu-item" onClick={handleLinkClick}>
            📊 Dashboard
          </Link>
          <Link to="/settings" className="menu-item" onClick={handleLinkClick}>
            ⚙️ Configurações
          </Link>
          <Link 
            to="/login" 
            className="menu-item"
            onClick={() => {
                localStorage.removeItem('token');
                handleLinkClick();
            }}
          >
            🚪 Sair
          </Link>
        </nav>
      </aside>

      {/* 2. Fundo Escuro (Opcional: clica fora pra fechar) */}
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}

      {/* 3. Conteúdo Principal */}
      <main className="content">
        <header className="topbar">
          {/* Botão Hambúrguer (Só aparece aqui) */}
          <button className="btn-menu" onClick={toggleMenu}>
            ☰
          </button>

          <span>Olá, <strong>{firstName}</strong></span>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;