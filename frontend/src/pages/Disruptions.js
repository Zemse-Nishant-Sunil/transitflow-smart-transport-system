import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import './Disruptions.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Disruptions() {
    const [disruptions, setDisruptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisruptions();
        const interval = setInterval(fetchDisruptions, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDisruptions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/disruptions/active`);
            setDisruptions(response.data.disruptions);
        } catch (error) {
            console.error('Failed to fetch disruptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityClass = (severity) => {
        const classes = {
            high: 'badge-danger',
            medium: 'badge-warning',
            low: 'badge-info'
        };
        return classes[severity] || 'badge-info';
    };

    return (
        <div className="disruptions fade-in">
            <div className="disruptions-header">
                <h1 className="page-title">Active Disruptions</h1>
                <p className="page-subtitle">Real-time service alerts and updates</p>
            </div>

            {loading ? (
                <div className="loading-state card">
                    <div className="loading-spinner"></div>
                    <p>Loading disruptions...</p>
                </div>
            ) : (
                <div className="disruptions-list">
                    {disruptions.length === 0 ? (
                        <div className="empty-state card">
                            <AlertTriangle size={64} className="empty-icon" />
                            <h3>No Active Disruptions</h3>
                            <p>All services are running normally</p>
                        </div>
                    ) : (
                        disruptions.map(disruption => (
                            <div key={disruption.id} className="disruption-card card">
                                <div className="disruption-header">
                                    <span className={`badge ${getSeverityClass(disruption.severity)}`}>
                                        {disruption.severity}
                                    </span>
                                    <h3 className="disruption-line">{disruption.line}</h3>
                                </div>
                                <p className="disruption-message">{disruption.message}</p>
                                <div className="disruption-meta">
                                    <div className="meta-item">
                                        <Clock size={16} />
                                        <span>Delay: {disruption.delay} min</span>
                                    </div>
                                    <div className="meta-item">
                                        <Users size={16} />
                                        <span>Affected: {disruption.affectedCommuters.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Disruptions;