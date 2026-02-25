import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Analytics from '../components/Analytics';
import Papa from 'papaparse';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Manual Entry' });
    const fileInputRef = useRef(null);

    // Hardcoded sales users for assignment
    const salesUsers = [
        { id: 'sales_1', name: 'Sales Rep 1' },
        { id: 'sales_2', name: 'Sales Rep 2' }
    ];

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLeads();
        }
    }, [user]);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/leads/${id}`, { status: newStatus });
            fetchLeads();
        } catch (err) {
            console.error(err);
        }
    };

    const updateAssignment = async (id, newAssignee) => {
        try {
            await api.patch(`/leads/${id}`, { assignedTo: newAssignee });
            fetchLeads();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/leads/${id}`);
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.msg || "Error deleting lead");
        }
    };

    const handleAddLead = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leads', newLead);
            setShowAddModal(false);
            setNewLead({ name: '', email: '', phone: '', source: 'Manual Entry' });
            fetchLeads();
        } catch (err) {
            alert('Error adding lead');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return '#3b82f6';
            case 'Contacted': return '#f59e0b';
            case 'Converted': return '#10b981';
            case 'Closed': return '#6b7280';
            default: return '#6b7280';
        }
    };

    // --- Export Functionality ---
    const handleExport = () => {
        const csvData = leads.map(lead => {
            const assignee = salesUsers.find(u => u.id === lead.assignedTo);
            return {
                Name: lead.name,
                Email: lead.email,
                Phone: lead.phone || '',
                Source: lead.source || '',
                Status: lead.status,
                AssignedTo: assignee ? assignee.name : 'Unassigned',
                Date: new Date(lead.createdAt).toISOString().split('T')[0]
            };
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'leads_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Import Functionality ---
    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const importedLeads = results.data;
                let successCount = 0;
                let failCount = 0;

                for (const row of importedLeads) {
                    const leadData = {
                        name: row.Name || row.name,
                        email: row.Email || row.email,
                        phone: row.Phone || row.phone,
                        source: 'Imported CSV'
                    };

                    if (leadData.name && leadData.email) {
                        try {
                            await api.post('/leads', leadData);
                            successCount++;
                        } catch (err) {
                            failCount++;
                        }
                    } else {
                        failCount++;
                    }
                }

                alert(`Import Finished: ${successCount} added, ${failCount} failed.`);
                fetchLeads();
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    return (
        <div className="container" style={{ position: 'relative' }}>
            <div className="dashboard-header">
                <h1 style={{ margin: 0 }}>{user?.role === 'admin' ? 'Admin Dashboard' : 'Your Leads'}</h1>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleExport}
                        className="btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                        Export CSV
                    </button>

                    <button
                        onClick={handleImportClick}
                        className="btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                        Import CSV
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary"
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        + Add New Lead
                    </button>
                </div>
            </div>

            {/* Analytics Section */}
            <Analytics leads={leads} />

            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', pading: '1rem'
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative', background: '#1e293b' }}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Add New Lead</h2>
                        <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text" placeholder="Name" required
                                value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                            />
                            <input
                                type="email" placeholder="Email" required
                                value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                            />
                            <input
                                type="tel" placeholder="Phone"
                                value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                            />
                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Save Lead</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="leads-grid" style={{ marginBottom: '3rem' }}>
                {leads.map((lead) => (
                    <div key={lead._id || lead.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: '1 1 200px' }}> {/* Allow growing and wrapping */}
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{lead.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{lead.email} | {lead.phone || 'No Phone'}</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Created: {new Date(lead.createdAt).toLocaleDateString()}</p>

                            {/* Updated Assignment UI for Admin */}
                            {user.role === 'admin' ? (
                                <div style={{ marginTop: '0.8rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Assign To:</label>
                                    <select
                                        value={lead.assignedTo || ''}
                                        onChange={(e) => updateAssignment(lead._id || lead.id, e.target.value)}
                                        style={{
                                            padding: '0.3rem',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white',
                                            border: '1px solid var(--glass-border)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="">Unassigned</option>
                                        {salesUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                lead.assignedTo && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Assigned: {lead.assignedTo}</span>
                                )
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <select
                                value={lead.status}
                                onChange={(e) => updateStatus(lead._id || lead.id, e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: getStatusColor(lead.status),
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    minWidth: '120px'
                                }}
                                disabled={user.role !== 'admin' && lead.assignedTo !== user.id}
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Converted">Converted</option>
                                <option value="Closed">Closed</option>
                            </select>

                            {user.role === 'admin' && (
                                <button onClick={() => deleteLead(lead._id || lead.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {leads.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No leads found.</p>}
            </div>
        </div>
    );
};

export default Dashboard;
