import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Activity, BarChart3, AlertTriangle, Menu, X } from 'lucide-react';
import './Navigation.css';

function Navigation({ connected }) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/journey-planner', label: 'Journey Planner', icon: Map },
        { path: '/live-tracking', label: 'Live Tracking', icon: Activity },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/disruptions', label: 'Disruptions', icon: AlertTriangle }
    ];

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <div className="brand-icon">
                        <Map size={32} strokeWidth={2.5} />
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-title">TransitFlow</h1>
                        <p className="brand-subtitle">Multi-Modal Journey Intelligence</p>
                    </div>
                </div>

                <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </div>

                <div className="nav-status">
                    <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
                        <div className="status-dot"></div>
                        <span className="status-text">{connected ? 'Live' : 'Offline'}</span>
                    </div>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
}

export default Navigation;