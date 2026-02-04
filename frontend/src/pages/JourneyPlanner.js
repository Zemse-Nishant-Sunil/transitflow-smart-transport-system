import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Calendar, Settings, Search, Clock, IndianRupee, TrendingUp, AlertCircle, ArrowRight, Train, Bus, Navigation2, User } from 'lucide-react';
import RouteCard from '../components/RouteCard';
import JourneyTimeline from '../components/JourneyTimeline';
import MapOverlay from '../components/MapOverlay';
import CrowdIndicator from '../components/CrowdIndicator';
import CitySelector from '../components/CitySelector';
import './JourneyPlanner.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function JourneyPlanner({ socket }) {
    const [origin, setOrigin] = useState({ lat: '', lng: '', name: '' });
    const [destination, setDestination] = useState({ lat: '', lng: '', name: '' });
    const [preferences, setPreferences] = useState({
        departureTime: new Date().toISOString().slice(0, 16),
        preferFast: true,
        avoidModes: []
    });
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [error, setError] = useState(null);

    // Sample locations for quick selection
    const popularLocations = [
        { name: 'Churchgate', lat: 18.9322, lng: 72.8264 },
        { name: 'Bhayandar', lat: 19.3012, lng: 72.8503 },
        { name: 'Andheri', lat: 19.1197, lng: 72.8464 },
        { name: 'Dadar', lat: 19.0176, lng: 72.8432 },
        { name: 'Thane', lat: 19.1872, lng: 72.9781 },
        { name: 'CSMT', lat: 18.9398, lng: 72.8355 }
    ];

    const handlePlanJourney = async () => {
        if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
            setError('Please select both origin and destination');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/api/journey/plan`, {
                origin: { lat: parseFloat(origin.lat), lng: parseFloat(origin.lng) },
                destination: { lat: parseFloat(destination.lat), lng: parseFloat(destination.lng) },
                preferences
            });

            setRoutes(response.data.routes);
            if (response.data.routes.length > 0) {
                setSelectedRoute(response.data.routes[0]);
            }
        } catch (err) {
            setError('Failed to plan journey. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const setQuickLocation = (location, type) => {
        if (type === 'origin') {
            setOrigin({ ...location });
        } else {
            setDestination({ ...location });
        }
    };

    const toggleModeAvoidance = (mode) => {
        setPreferences(prev => ({
            ...prev,
            avoidModes: prev.avoidModes.includes(mode)
                ? prev.avoidModes.filter(m => m !== mode)
                : [...prev.avoidModes, mode]
        }));
    };

    return (
        <div className="journey-planner">
            <div className="planner-header slide-in">
                <h1 className="page-title">Plan Your Journey</h1>
                <p className="page-subtitle">End-to-end multi-modal route planning with real-time updates</p>
            </div>

            <div className="planner-grid">
                <div className="planner-sidebar">
                    <div className="card slide-in">
                        <div className="card-header">
                            <MapPin className="header-icon" />
                            <h2 className="card-title">Journey Details</h2>
                        </div>

                        <CitySelector onSelect={(city) => console.log('City selected', city)} />

                        <div className="location-section">
                            <div className="input-group">
                                <label className="input-label">
                                    <User size={16} />
                                    Origin
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter location name"
                                    value={origin.name}
                                    onChange={(e) => setOrigin({ ...origin, name: e.target.value })}
                                />
                                <div className="coord-inputs">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="input"
                                        placeholder="Latitude"
                                        value={origin.lat}
                                        onChange={(e) => setOrigin({ ...origin, lat: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="input"
                                        placeholder="Longitude"
                                        value={origin.lng}
                                        onChange={(e) => setOrigin({ ...origin, lng: e.target.value })}
                                    />
                                </div>
                                <div className="quick-locations">
                                    {popularLocations.slice(0, 3).map(loc => (
                                        <button
                                            key={loc.name}
                                            className="quick-location-btn"
                                            onClick={() => setQuickLocation(loc, 'origin')}
                                        >
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    <MapPin size={16} />
                                    Destination
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter location name"
                                    value={destination.name}
                                    onChange={(e) => setDestination({ ...destination, name: e.target.value })}
                                />
                                <div className="coord-inputs">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="input"
                                        placeholder="Latitude"
                                        value={destination.lat}
                                        onChange={(e) => setDestination({ ...destination, lat: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        step="0.0001"
                                        className="input"
                                        placeholder="Longitude"
                                        value={destination.lng}
                                        onChange={(e) => setDestination({ ...destination, lng: e.target.value })}
                                    />
                                </div>
                                <div className="quick-locations">
                                    {popularLocations.slice(3, 6).map(loc => (
                                        <button
                                            key={loc.name}
                                            className="quick-location-btn"
                                            onClick={() => setQuickLocation(loc, 'destination')}
                                        >
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="preferences-section">
                            <div className="input-group">
                                <label className="input-label">
                                    <Calendar size={16} />
                                    Departure Time
                                </label>
                                <input
                                    type="datetime-local"
                                    className="input"
                                    value={preferences.departureTime}
                                    onChange={(e) => setPreferences({ ...preferences, departureTime: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    <Settings size={16} />
                                    Optimization
                                </label>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${preferences.preferFast ? 'active' : ''}`}
                                        onClick={() => setPreferences({ ...preferences, preferFast: true })}
                                    >
                                        <Clock size={16} />
                                        Fastest
                                    </button>
                                    <button
                                        className={`toggle-btn ${!preferences.preferFast ? 'active' : ''}`}
                                        onClick={() => setPreferences({ ...preferences, preferFast: false })}
                                    >
                                        <IndianRupee size={16} />
                                        Cheapest
                                    </button>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Avoid Transport Modes</label>
                                <div className="mode-toggles">
                                    {['local_train', 'metro', 'bus', 'auto'].map(mode => (
                                        <button
                                            key={mode}
                                            className={`mode-toggle ${preferences.avoidModes.includes(mode) ? 'avoided' : ''}`}
                                            onClick={() => toggleModeAvoidance(mode)}
                                        >
                                            {mode.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-search"
                            onClick={handlePlanJourney}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading"></div>
                                    Planning...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Find Routes
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="error-message fade-in">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="planner-results">
                    <div className="map-pane card">
                        <MapOverlay socket={socket} center={[19.0760, 72.8777]} zoom={12} />
                    </div>

                    {routes.length === 0 && !loading && (
                        <div className="empty-state card">
                            <Navigation2 size={64} className="empty-icon" />
                            <h3>Ready to Plan Your Journey</h3>
                            <p>Enter your origin and destination to discover the best multi-modal routes</p>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-state card">
                            <div className="loading-spinner"></div>
                            <p>Finding the best routes for you...</p>
                        </div>
                    )}

                    {routes.length > 0 && (
                        <div className="routes-container fade-in">
                            <div className="routes-header">
                                <h2 className="routes-title">
                                    {routes.length} Route{routes.length !== 1 ? 's' : ''} Found
                                </h2>
                                <p className="routes-subtitle">
                                    From {origin.name || 'Origin'} to {destination.name || 'Destination'}
                                </p>
                            </div>

                            <div className="routes-list">
                                {routes.map((route, index) => (
                                    <RouteCard
                                        key={route.id}
                                        route={route}
                                        index={index}
                                        selected={selectedRoute?.id === route.id}
                                        onSelect={() => setSelectedRoute(route)}
                                        socket={socket}
                                    />
                                ))}
                            </div>

                            {selectedRoute && (
                                <div className="selected-route-panel card">
                                    <JourneyTimeline route={selectedRoute} />
                                    <div style={{ marginTop: 8 }}>
                                        <h4>Predicted Crowd</h4>
                                        <CrowdIndicator station={selectedRoute.segments[0]?.from} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JourneyPlanner;