import React from 'react';
import './JourneyTimeline.css';

export default function JourneyTimeline({ route }) {
    if (!route) return null;

    return (
        <div className="journey-timeline card">
            <h4>Journey Timeline</h4>
            <ol className="timeline-list">
                {route.segments.map(seg => (
                    <li key={seg.id} className="timeline-item">
                        <div className="seg-mode">{seg.mode}</div>
                        <div className="seg-times">{seg.departureTime ? new Date(seg.departureTime).toLocaleTimeString() : ''} → {seg.arrivalTime ? new Date(seg.arrivalTime).toLocaleTimeString() : ''}</div>
                        <div className="seg-instr">{seg.instructions}</div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
