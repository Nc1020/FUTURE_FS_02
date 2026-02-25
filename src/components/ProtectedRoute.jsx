import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // While loading, maybe show a spinner or nothing?
    if (loading) return <div>Loading...</div>;

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
