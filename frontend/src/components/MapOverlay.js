import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import './MapOverlay.css';

// Fix default icon paths for Leaflet when using bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

// Custom icons for different locations
const userLocationIcon = L.divIcon({
    className: 'user-location-icon',
    html: `<div style="
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #3B82F6, #1E40AF);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const stationIcon = L.divIcon({
    className: 'station-icon',
    html: `<div style="
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #FF6B35, #FF8A50);
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: white;
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.5);
    ">🚂</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const originStationIcon = L.divIcon({
    className: 'origin-station-icon',
    html: `<div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10B981, #059669);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        color: white;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
    ">A</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const destinationStationIcon = L.divIcon({
    className: 'destination-station-icon',
    html: `<div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #EF4444, #DC2626);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        color: white;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
    ">B</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const vehicleIcon = L.divIcon({
    className: 'vehicle-icon',
    html: '<div class="vehicle-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Train track data - Mumbai local train network coordinates
const trainTracks = {
    western_line: [
        [18.9322, 72.8264], // Churchgate
        [18.9434, 72.8234], // Marine Lines
        [18.9533, 72.8196], // Charni Road
        [18.9639, 72.8155], // Grant Road
        [18.9685, 72.8194], // Mumbai Central
        [18.9827, 72.8233], // Mahalaxmi
        [18.9969, 72.8304], // Lower Parel
        [19.0176, 72.8432], // Dadar
        [19.0544, 72.8407], // Bandra
        [19.1197, 72.8464], // Andheri
        [19.1645, 72.8489], // Goregaon
        [19.1868, 72.8481], // Malad
        [19.2037, 72.8496], // Kandivali
        [19.2304, 72.8577], // Borivali
        [19.2807, 72.8717], // Mira Road
        [19.3012, 72.8503]  // Bhayandar
    ],
    central_line: [
        [18.9398, 72.8355], // CSMT
        [18.9791, 72.8318], // Byculla
        [19.0176, 72.8432], // Dadar
        [19.0658, 72.8782], // Kurla
        [19.0864, 72.9081], // Ghatkopar
        [19.1076, 72.9294], // Vikhroli
        [19.1302, 72.9323], // Kanjurmarg
        [19.1440, 72.9371], // Bhandup
        [19.1723, 72.9558], // Mulund
        [19.1872, 72.9781]  // Thane
    ]
};

// All station data
const allStations = {
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

export default function MapOverlay({
    socket,
    center = [19.0760, 72.8777],
    zoom = 12,
    userLocation = null,
    originStation = null,
    destinationStation = null,
    showTracks = true
}) {
    const [vehicles, setVehicles] = useState({});

    useEffect(() => {
        if (!socket) return;

        socket.on('gtfs_vehicle_position', ({ vehicle }) => {
            const id = vehicle.vehicle && vehicle.vehicle.id ? vehicle.vehicle.id : `v_${Date.now()}`;
            setVehicles(prev => ({ ...prev, [id]: vehicle }));
        });

        return () => {
            socket.off('gtfs_vehicle_position');
        };
    }, [socket]);

    // Calculate dynamic center based on markers
    const getMapCenter = () => {
        if (originStation && destinationStation) {
            return [
                (originStation.lat + destinationStation.lat) / 2,
                (originStation.lng + destinationStation.lng) / 2
            ];
        }
        if (userLocation) {
            return [userLocation.lat, userLocation.lng];
        }
        return center;
    };

    return (
        <div className="map-overlay" style={{ height: '100%' }}>
            <MapContainer center={getMapCenter()} zoom={zoom} style={{ height: '100%' }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Train tracks */}
                {showTracks && (
                    <LayerGroup>
                        {/* Western Line - Orange */}
                        <Polyline
                            positions={trainTracks.western_line}
                            color="#FF6B35"
                            weight={3}
                            opacity={0.7}
                            dashArray="5, 5"
                        >
                            <Popup>Western Line - Local Train</Popup>
                        </Polyline>

                        {/* Central Line - Blue */}
                        <Polyline
                            positions={trainTracks.central_line}
                            color="#0066CC"
                            weight={3}
                            opacity={0.7}
                            dashArray="5, 5"
                        >
                            <Popup>Central Line - Local Train</Popup>
                        </Polyline>
                    </LayerGroup>
                )}

                {/* All stations on track */}
                {showTracks && Object.values(allStations).map((station) => (
                    <Marker
                        key={station.id}
                        position={[station.lat, station.lng]}
                        icon={stationIcon}
                    >
                        <Popup>
                            <div style={{ padding: '8px' }}>
                                <strong>{station.name}</strong>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    {station.modes.join(', ')}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* User Location */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                        <Popup>
                            <div style={{ padding: '8px' }}>
                                <strong>📍 Your Location</strong>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    Lat: {userLocation.lat.toFixed(4)}<br />
                                    Lng: {userLocation.lng.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Origin Station Marker */}
                {originStation && (
                    <Marker
                        position={[originStation.lat, originStation.lng]}
                        icon={originStationIcon}
                    >
                        <Popup>
                            <div style={{ padding: '8px' }}>
                                <strong>🟢 Origin: {originStation.name}</strong>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    {originStation.modes.join(', ')}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Destination Station Marker */}
                {destinationStation && (
                    <Marker
                        position={[destinationStation.lat, destinationStation.lng]}
                        icon={destinationStationIcon}
                    >
                        <Popup>
                            <div style={{ padding: '8px' }}>
                                <strong>🔴 Destination: {destinationStation.name}</strong>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    {destinationStation.modes.join(', ')}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Active vehicles */}
                {Object.values(vehicles).map((v, idx) => (
                    v && v.position_lat ? (
                        <Marker key={idx} position={[v.position_lat, v.position_lon]} icon={vehicleIcon}>
                            <Popup>
                                <div>
                                    <strong>{v.vehicle && v.vehicle.label}</strong>
                                    <div>Route: {v.trip && v.trip.trip_id}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
}
