import { useRef, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = ({ leads }) => {
    // 1. Calculate Summary Stats
    const totalLeads = leads.length;

    // Status counts
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;
    const lostLeads = leads.filter(l => l.status === 'Closed').length;

    // Business Logic: Assume Average Deal Value = $1,500
    const estimatedRevenue = convertedLeads * 1500;

    // Growth Logic (Comparison with last month)
    // For simplicity, we just look at the last 2 created leads dates or bucketing
    // A robust implementation would need precise month buckets.

    // Percentage
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // 2. Prepare Chart Data (Time-based & Performance)
    const { chartData, growthPercentage } = useMemo(() => {
        const monthMap = {};

        // Bucketing
        leads.forEach(lead => {
            const d = new Date(lead.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!monthMap[key]) {
                monthMap[key] = { total: 0, converted: 0 };
            }
            monthMap[key].total += 1;
            if (lead.status === 'Converted') {
                monthMap[key].converted += 1;
            }
        });

        const sortedKeys = Object.keys(monthMap).sort();

        // Calculate Growth (Last month vs Previous)
        let growth = 0;
        if (sortedKeys.length >= 2) {
            const lastMonth = monthMap[sortedKeys[sortedKeys.length - 1]].total;
            const prevMonth = monthMap[sortedKeys[sortedKeys.length - 2]].total;
            if (prevMonth > 0) {
                growth = ((lastMonth - prevMonth) / prevMonth) * 100;
            } else {
                growth = 100; // infinite growth from 0
            }
        }

        // Generate Labels
        const labels = sortedKeys.map(key => {
            const [y, m] = key.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1);
            return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });

        const totalData = sortedKeys.map(key => monthMap[key].total);
        const convertedData = sortedKeys.map(key => monthMap[key].converted);

        return {
            growthPercentage: growth.toFixed(0),
            chartData: {
                labels,
                datasets: [
                    {
                        label: 'Total Leads',
                        data: totalData,
                        backgroundColor: 'rgba(99, 102, 241, 0.6)', // Indigo
                        borderRadius: 4
                    },
                    {
                        label: 'Converted Deals',
                        data: convertedData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
                        borderRadius: 4
                    }
                ],
            }
        };
    }, [leads]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: 'white' }
            },
            title: {
                display: true,
                text: 'Business Growth & Conversion Performance',
                color: 'white',
                font: { size: 16 }
            },
        },
        scales: {
            x: {
                ticks: { color: '#cbd5e1' },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#cbd5e1', stepSize: 1 },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Business Analytics</h2>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-bg)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Active Companies</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginTop: '0.5rem' }}>
                        {convertedLeads} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'normal' }}>Clients</span>
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-bg)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Revenue (Est.)</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#34d399', marginTop: '0.5rem' }}>
                        ${estimatedRevenue.toLocaleString()}
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-bg)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Conversion Rate</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.5rem' }}>
                        {conversionRate}%
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-bg)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Monthly Growth</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: Number(growthPercentage) >= 0 ? '#34d399' : '#ef4444' }}>
                            {Number(growthPercentage) > 0 ? '+' : ''}{growthPercentage}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', height: '400px', position: 'relative' }}>
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

export default Analytics;
