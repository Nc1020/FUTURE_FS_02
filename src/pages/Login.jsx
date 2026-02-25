import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', formData);
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid Credentials');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30, 41, 59, 0.5)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30, 41, 59, 0.5)', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Login
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;
