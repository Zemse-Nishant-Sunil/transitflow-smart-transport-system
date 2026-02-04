import React from 'react';

export default function Badges() {
    const badges = [
        { id: 'eco', title: 'Eco Traveler', desc: 'Saved CO₂ by choosing public transport' },
        { id: 'time', title: 'Time Saver', desc: 'Saved time using optimized routes' }
    ];

    return (
        <div className="badges-page card">
            <h1>Achievements</h1>
            <div className="badges-grid">
                {badges.map(b => (
                    <div key={b.id} className="badge card">
                        <h3>{b.title}</h3>
                        <p>{b.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
