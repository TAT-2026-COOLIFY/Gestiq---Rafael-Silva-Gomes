import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
    LayoutDashboard,
    Folder,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import styles from './Sidebar.module.css';

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { signOut, user } = useAuth();

    const toggleSideBar = () => setIsOpen(!isOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <>
            <button className={styles.mobileBtn} onClick={toggleSideBar}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && <div className={styles.overlay} onClick={toggleSideBar} />}

            <aside className={`
                    ${styles.sidebar} 
                    ${isOpen ? styles.open : ''}
                    ${isCollapsed ? styles.collapsed : ''}
                `}>
                <div className={styles.header}>
                    {!isCollapsed && <span className={styles.logo}>GP Projects</span>}

                    <button className={styles.collapseBtn} onClick={toggleCollapse}>
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className={styles.nav}>
                    <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : styles.link}> 
                        <LayoutDashboard size={20} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>

                    <NavLink to="/projeto/novo" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                        <Folder size={20} />
                        {!isCollapsed && <span>Novo Projeto</span>}
                    </NavLink>

                    <NavLink to="/settings" className={({ isActive }) => isActive ? styles.activeLink : styles.link} >
                        <Settings size={20} />
                        {!isCollapsed && <span>Configurações</span>}
                    </NavLink>
                </nav>

                <div className={styles.footer}>
                    {!isCollapsed && (
                        <div className={styles.userInfo}>
                            <p>{user?.first_name || 'Usuário'}</p>
                        </div>
                    )}
                    <button onClick={signOut} className={styles.logoutBtn}>
                        <LogOut size={20} />
                        {!isCollapsed && <span>Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}