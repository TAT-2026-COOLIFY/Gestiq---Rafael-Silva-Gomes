import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./features/Auth/Login/Login";
import { Register } from "./features/Auth/Register/Register";
import { Dashboard } from "./features/Dashboard";
import { ProjectDetails } from "./features/ProjectDetails";
import { Layout } from "./components/Layout";
import { ProjectForm } from "./features/ProjectForm";
import { Settings } from "./features/Settings";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projeto/novo" element={<ProjectForm />} />
            <Route path="/projeto/:id" element={<ProjectDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
