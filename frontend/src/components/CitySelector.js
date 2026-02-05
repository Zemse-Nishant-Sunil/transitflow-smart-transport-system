import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CitySelector.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CitySelector({ onSelect }) {
    const [cities, setCities] = useState([]);

    useEffect(() => {
        // Query backend for known feeds
        axios.get(`${API_URL}/api/feeds/list`).then(resp => {
            setCities(resp.data.feeds || []);
        }).catch(() => setCities([]));

        // Try to geolocate user and detect country
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                // Reverse geocode with free service (placeholder)
                const { latitude, longitude } = pos.coords;
                try {
                    const r = await axios.get(`https://geocode.xyz/${latitude},${longitude}?geoit=json`);
                    const country = (r.data && r.data.country) || null;
                    // Ask backend to detect language/currency
                    // Backend API expects country code e.g., ?country=IN
                    // This is a best-effort auto-select - user can override
                    if (country) {
                        console.log('Detected country:', country);
                    }
                } catch (err) {
                    // ignore
                }
            }, () => { });
        }
    }, []);

    return (
        <div className="city-selector">
            <h4>Select City</h4>
            <div className="city-list">
                {/* <button onClick={() => onSelect('auto')}>Auto-detect {detected ? `(${detected})` : ''}</button> */}
                {cities.map(c => (
                    <button key={c} onClick={() => onSelect(c)}>{c}</button>
                ))}
                {/* {cities.length === 0 && <p>No city feeds registered yet.</p>} */}
            </div>
        </div>
    );
}
