import { useState, useEffect, use } from "react";
import api from "../services/api";
import { Link, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Layout.css";

function Layout() {

  const [user, setUser] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');

    if(token) {
      const decode = jwtDecode(token);
      const userId = decode.user_id;

      api.get(`users/${userId}/`)
        .then(response => {
          setUser(response.data.first_name || response.data.username);
      })
      .catch(error => {
        console.error("Erro ao buscar dados do usuário:", error);
      });
    }
  }, []); 

  return (  
    <div className="layout-container">
      <aside className="sidebar">
        <div className="logo">Gestão TCC</div>

        <nav>
          <Link to="/" className="menu-item">
            📊 Dashboard
          </Link>
          <Link to="/login" className="menu-item" onClick={() => localStorage.removeItem('token')}>
            🚪 Sair (Ir p/ Login)
          </Link>
          <Link to="/settings" className="menu-item">
            Configurações
          </Link>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <span>Bem-vindo, <strong>{user}</strong></span>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
