import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import styles from "./Layout.module.css";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.wrapper}>
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      <main
        className={`${styles.mainContent} ${isCollapsed ? styles.contentExpanded : ""}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
