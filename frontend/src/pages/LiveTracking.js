import React from 'react';
import { Activity, MapPin } from 'lucide-react';
import './LiveTracking.css';

function LiveTracking() {
    return (
        <div className="live-tracking fade-in">
            <div className="tracking-header">
                <h1 className="page-title">Live Journey Tracking</h1>
                <p className="page-subtitle">Real-time updates for your active journey</p>
            </div>

            <div className="empty-state card">
                <Activity size={64} className="empty-icon" />
                <h3>No Active Journey</h3>
                <p>Start a journey from the planner to track it in real-time</p>
            </div>
        </div>
    );
}

export default LiveTracking;