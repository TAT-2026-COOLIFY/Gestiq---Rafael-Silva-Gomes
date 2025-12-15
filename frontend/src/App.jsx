import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import Layout from "./components/Layout";
import ProjectForm from "./pages/ProjectForm";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projeto/novo" element={<ProjectForm />} />
          <Route path="/projeto/:id" element={<ProjectDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
