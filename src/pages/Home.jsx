import { useState } from 'react';
import api from '../api/axios';

const Home = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'Website Contact Form'
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leads/public', formData);
            setMessage('Unleash your potential! We will contact you shortly.');
            setFormData({ name: '', email: '', phone: '', source: 'Website Contact Form' });
        } catch (err) {
            console.error(err);
            setMessage('Error submitting form. Please try again.');
        }
    };

    return (
        <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Grow Your Business
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Capture leads and manage your clients efficiently.
                </p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Contact Us</h2>
                {message && <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', textAlign: 'center' }}>{message}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30, 41, 59, 0.5)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30, 41, 59, 0.5)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(30, 41, 59, 0.5)', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Submit Inquiry
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;
