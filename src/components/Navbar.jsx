import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', color: 'transparent', textDecoration: 'none' }}>
                    LeadManager
                </Link>
            </div>

            <div className="nav-links">
                <Link to="/" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Home</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" style={{ fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>Dashboard</Link>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {user.username} ({user.role})
                        </div>
                        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', textDecoration: 'none' }}>Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
