import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, AlertTriangle, Users, Activity } from 'lucide-react';
import './Analytics.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Analytics() {
    const [dashboard, setDashboard] = useState(null);
    const [popularRoutes, setPopularRoutes] = useState([]);
    const [disruptions, setDisruptions] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [dashRes, routesRes, disruptRes, recRes] = await Promise.all([
                axios.get(`${API_URL}/api/analytics/system-health`),
                axios.get(`${API_URL}/api/analytics/popular-routes?limit=5`),
                axios.get(`${API_URL}/api/analytics/disruption-hotspots`),
                axios.get(`${API_URL}/api/analytics/recommendations`)
            ]);

            setDashboard(dashRes.data.health);
            setPopularRoutes(routesRes.data.routes);
            setDisruptions(disruptRes.data.hotspots);
            setRecommendations(recRes.data.recommendations);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="analytics fade-in">
            <div className="analytics-header">
                <h1 className="page-title">Transport Planner Dashboard</h1>
                <p className="page-subtitle">System insights, performance metrics, and recommendations</p>
            </div>

            {dashboard && (
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon health">
                            <Activity size={24} />
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{dashboard.overallHealth}%</h3>
                            <p className="metric-label">System Health</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon performance">
                            <TrendingUp size={24} />
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{dashboard.onTimePerformance}%</h3>
                            <p className="metric-label">On-Time Performance</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon satisfaction">
                            <Users size={24} />
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{dashboard.customerSatisfaction}%</h3>
                            <p className="metric-label">Satisfaction</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon disruptions">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{dashboard.metrics.activeDisruptions}</h3>
                            <p className="metric-label">Active Disruptions</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="analytics-grid">
                <div className="card">
                    <h2 className="section-title">Popular Routes</h2>
                    <div className="routes-table">
                        {popularRoutes.map((route, idx) => (
                            <div key={idx} className="route-row">
                                <div className="route-rank">{idx + 1}</div>
                                <div className="route-info">
                                    <p className="route-name">{route.route}</p>
                                    <p className="route-stats">
                                        {route.totalJourneys.toLocaleString()} journeys • Avg {route.avgDuration}min • ₹{route.avgCost}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h2 className="section-title">Disruption Hotspots</h2>
                    <div className="hotspots-list">
                        {disruptions.slice(0, 5).map((hotspot, idx) => (
                            <div key={idx} className="hotspot-item">
                                <div className="hotspot-header">
                                    <span className="hotspot-line">{hotspot.line}</span>
                                    <span className="badge badge-danger">{hotspot.totalDisruptions} incidents</span>
                                </div>
                                <p className="hotspot-detail">
                                    Most common: {hotspot.mostCommonType.replace('_', ' ')} • Avg {hotspot.avgDuration}min delay
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="section-title">Infrastructure Recommendations</h2>
                <div className="recommendations-list">
                    {recommendations.map(rec => (
                        <div key={rec.id} className={`recommendation priority-${rec.priority}`}>
                            <div className="rec-header">
                                <span className={`priority-badge priority-${rec.priority}`}>{rec.priority}</span>
                                <h3 className="rec-title">{rec.title}</h3>
                            </div>
                            <p className="rec-description">{rec.description}</p>
                            <div className="rec-details">
                                <span>Impact: {rec.estimatedImpact}</span>
                                <span>Cost: {rec.estimatedCost}</span>
                                <span>Time: {rec.implementationTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Analytics;