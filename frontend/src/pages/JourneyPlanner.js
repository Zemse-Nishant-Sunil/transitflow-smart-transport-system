import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Calendar, Settings, Search, Clock, IndianRupee, TrendingUp, AlertCircle, ArrowRight, Train, Bus, Navigation2, User, Locate } from 'lucide-react';
import RouteCard from '../components/RouteCard';
import JourneyTimeline from '../components/JourneyTimeline';
import MapOverlay from '../components/MapOverlay';
import CrowdIndicator from '../components/CrowdIndicator';
import CitySelector from '../components/CitySelector';
import './JourneyPlanner.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Station database
const STATIONS_DB = {
    'churchgate': { id: 'churchgate', name: 'Churchgate', lat: 18.9322, lng: 72.8264, modes: ['local_train', 'metro'] },
    'marine_lines': { id: 'marine_lines', name: 'Marine Lines', lat: 18.9434, lng: 72.8234, modes: ['local_train'] },
    'charni_road': { id: 'charni_road', name: 'Charni Road', lat: 18.9533, lng: 72.8196, modes: ['local_train'] },
    'grant_road': { id: 'grant_road', name: 'Grant Road', lat: 18.9639, lng: 72.8155, modes: ['local_train'] },
    'mumbai_central': { id: 'mumbai_central', name: 'Mumbai Central', lat: 18.9685, lng: 72.8194, modes: ['local_train', 'metro'] },
    'mahalaxmi': { id: 'mahalaxmi', name: 'Mahalaxmi', lat: 18.9827, lng: 72.8233, modes: ['local_train'] },
    'lower_parel': { id: 'lower_parel', name: 'Lower Parel', lat: 18.9969, lng: 72.8304, modes: ['local_train', 'metro'] },
    'dadar': { id: 'dadar', name: 'Dadar', lat: 19.0176, lng: 72.8432, modes: ['local_train', 'metro', 'bus_terminal'] },
    'bandra': { id: 'bandra', name: 'Bandra', lat: 19.0544, lng: 72.8407, modes: ['local_train', 'metro', 'bus_terminal'] },
    'andheri': { id: 'andheri', name: 'Andheri', lat: 19.1197, lng: 72.8464, modes: ['local_train', 'metro', 'bus_terminal'] },
    'goregaon': { id: 'goregaon', name: 'Goregaon', lat: 19.1645, lng: 72.8489, modes: ['local_train', 'metro'] },
    'malad': { id: 'malad', name: 'Malad', lat: 19.1868, lng: 72.8481, modes: ['local_train'] },
    'kandivali': { id: 'kandivali', name: 'Kandivali', lat: 19.2037, lng: 72.8496, modes: ['local_train'] },
    'borivali': { id: 'borivali', name: 'Borivali', lat: 19.2304, lng: 72.8577, modes: ['local_train', 'metro', 'bus_terminal'] },
    'mira_road': { id: 'mira_road', name: 'Mira Road', lat: 19.2807, lng: 72.8717, modes: ['local_train'] },
    'bhayandar': { id: 'bhayandar', name: 'Bhayandar', lat: 19.3012, lng: 72.8503, modes: ['local_train', 'bus_terminal'] },
    'csmt': { id: 'csmt', name: 'CSMT', lat: 18.9398, lng: 72.8355, modes: ['local_train', 'metro'] },
    'byculla': { id: 'byculla', name: 'Byculla', lat: 18.9791, lng: 72.8318, modes: ['local_train'] },
    'kurla': { id: 'kurla', name: 'Kurla', lat: 19.0658, lng: 72.8782, modes: ['local_train', 'metro', 'bus_terminal'] },
    'ghatkopar': { id: 'ghatkopar', name: 'Ghatkopar', lat: 19.0864, lng: 72.9081, modes: ['local_train', 'metro'] },
    'vikhroli': { id: 'vikhroli', name: 'Vikhroli', lat: 19.1076, lng: 72.9294, modes: ['local_train'] },
    'kanjurmarg': { id: 'kanjurmarg', name: 'Kanjurmarg', lat: 19.1302, lng: 72.9323, modes: ['local_train', 'metro'] },
    'bhandup': { id: 'bhandup', name: 'Bhandup', lat: 19.1440, lng: 72.9371, modes: ['local_train'] },
    'mulund': { id: 'mulund', name: 'Mulund', lat: 19.1723, lng: 72.9558, modes: ['local_train', 'bus_terminal'] },
    'thane': { id: 'thane', name: 'Thane', lat: 19.1872, lng: 72.9781, modes: ['local_train', 'metro', 'bus_terminal'] }
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Find nearest station to a location
function findNearestStation(lat, lng, maxDistance = 2) {
    let nearest = null;
    let minDistance = maxDistance;

    Object.values(STATIONS_DB).forEach(station => {
        const distance = calculateDistance(lat, lng, station.lat, station.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = { ...station, distance };
        }
    });

    return nearest;
}

function JourneyPlanner({ socket }) {
    const [origin, setOrigin] = useState({ lat: '', lng: '', name: '' });
    const [destination, setDestination] = useState({ lat: '', lng: '', name: '' });
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
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

    // Get user's current location
    const getUserLocation = () => {
        setLocationLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const userLoc = { lat: latitude, lng: longitude };
                setUserLocation(userLoc);

                // Find nearest station
                const nearestStation = findNearestStation(latitude, longitude);

                if (nearestStation) {
                    // Auto-populate origin with nearest station
                    setOrigin({
                        lat: nearestStation.lat,
                        lng: nearestStation.lng,
                        name: nearestStation.name,
                        stationId: nearestStation.id
                    });

                    setError(null);
                } else {
                    setError('No nearby stations found. Please enter location manually.');
                }

                setLocationLoading(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocationError(`Unable to get location: ${error.message}`);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

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
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <label className="input-label" style={{ margin: 0 }}>
                                        <User size={16} />
                                        Origin
                                    </label>
                                    <button
                                        className="location-btn"
                                        onClick={getUserLocation}
                                        disabled={locationLoading}
                                        title="Get your current location"
                                    >
                                        <Locate size={16} />
                                        {locationLoading ? 'Detecting...' : 'Detect'}
                                    </button>
                                </div>
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
                                {locationError && (
                                    <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '0.5rem' }}>
                                        {locationError}
                                    </div>
                                )}
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
                        <MapOverlay
                            socket={socket}
                            center={[19.0760, 72.8777]}
                            zoom={12}
                            userLocation={userLocation}
                            originStation={origin.lat ? STATIONS_DB[Object.keys(STATIONS_DB).find(key =>
                                STATIONS_DB[key].lat === parseFloat(origin.lat) && STATIONS_DB[key].lng === parseFloat(origin.lng)
                            )] : null}
                            destinationStation={destination.lat ? STATIONS_DB[Object.keys(STATIONS_DB).find(key =>
                                STATIONS_DB[key].lat === parseFloat(destination.lat) && STATIONS_DB[key].lng === parseFloat(destination.lng)
                            )] : null}
                            showTracks={true}
                        />
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