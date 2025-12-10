import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="logo">Gestão TCC</div>

        <nav>
          <Link to="/" className="menu-item">
            📊 Dashboard
          </Link>
          <Link to="/login" className="menu-item">
            🚪 Sair (Ir p/ Login)
          </Link>
          <Link to="/settings" className="menu-item">
            Configurações
          </Link>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <span>Bem-vindo, Usuário</span>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
