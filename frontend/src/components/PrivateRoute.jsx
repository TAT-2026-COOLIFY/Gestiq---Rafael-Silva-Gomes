import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth';

const PrivateRoute = () => {
    const { signed, loading } = useAuth();
    
    if (loading) return <div>Validando acesso...</div>;

    return signed ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;